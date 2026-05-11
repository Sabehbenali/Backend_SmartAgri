// services/dataAggregator.service.js

class DataAggregatorService {
  /**
   * Collecte TOUTES les données pertinentes pour diagnostic IA
   */
  async collectDiagnosticData(farmId, userId) {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // 1. Données capteurs actuelles
    const currentSensors = await Sensor.find({ 
      farmId, 
      isActive: true 
    }).lean();

    // 2. Historique capteurs (7 jours)
    const sensorHistory = await SensorReading.aggregate([
      {
        $match: {
          farmId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            sensorType: '$sensorType',
            hour: { $hour: '$timestamp' }
          },
          avgValue: { $avg: '$value' },
          minValue: { $min: '$value' },
          maxValue: { $max: '$value' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.hour': 1 } }
    ]);

    // 3. Tendances (évolution)
    const trends = await this.calculateTrends(farmId, sevenDaysAgo, now);

    // 4. Alertes récentes
    const recentAlerts = await Alert.find({
      farmId,
      createdAt: { $gte: sevenDaysAgo },
      status: { $in: ['pending', 'active'] }
    }).lean();

    // 5. Interventions passées
    const interventions = await Intervention.find({
      farmId,
      date: { $gte: thirtyDaysAgo }
    }).lean();

    // 6. Données météo (si API météo disponible)
    const weatherForecast = await this.getWeatherForecast(farmId);

    // 7. Informations de culture
    const cropInfo = await Crop.findOne({ farmId }).lean();

    // 8. Production historique (30 jours)
    const productionHistory = await Production.aggregate([
      {
        $match: {
          farmId,
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          avgYield: { $avg: '$yield' },
          totalYield: { $sum: '$yield' },
          avgQuality: { $avg: '$quality' }
        }
      }
    ]);

    return {
      current: {
        sensors: currentSensors,
        timestamp: now
      },
      historical: {
        sensorReadings: sensorHistory,
        trends: trends,
        interventions: interventions,
        production: productionHistory[0] || {}
      },
      alerts: recentAlerts,
      weather: weatherForecast,
      crop: cropInfo,
      analysis: {
        dataPoints: sensorHistory.length,
        period: {
          start: sevenDaysAgo,
          end: now,
          days: 7
        }
      }
    };
  }

  /**
   * Calcule les tendances (évolution)
   */
  async calculateTrends(farmId, startDate, endDate) {
    const readings = await SensorReading.find({
      farmId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 }).lean();

    const trends = {};

    // Grouper par type de capteur
    const byType = readings.reduce((acc, reading) => {
      if (!acc[reading.sensorType]) acc[reading.sensorType] = [];
      acc[reading.sensorType].push(reading);
      return acc;
    }, {});

    // Calculer tendance pour chaque type
    for (const [type, values] of Object.entries(byType)) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));

      const avgFirst = firstHalf.reduce((sum, r) => sum + r.value, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((sum, r) => sum + r.value, 0) / secondHalf.length;

      const change = avgSecond - avgFirst;
      const changePercent = (change / avgFirst) * 100;

      trends[type] = {
        direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        change: change,
        changePercent: changePercent.toFixed(2),
        avgFirst: avgFirst.toFixed(2),
        avgSecond: avgSecond.toFixed(2),
        status: this.getTrendStatus(type, changePercent)
      };
    }

    return trends;
  }

  getTrendStatus(sensorType, changePercent) {
    // Logique métier pour déterminer si la tendance est bonne/mauvaise
    const thresholds = {
      temperature: { good: [-5, 5], warning: [-10, 10] },
      soilMoisture: { good: [-10, 10], warning: [-20, 20] },
      airHumidity: { good: [-15, 15], warning: [-25, 25] }
    };

    const threshold = thresholds[sensorType] || { good: [-10, 10], warning: [-20, 20] };

    if (Math.abs(changePercent) <= Math.abs(threshold.good[1])) {
      return 'normal';
    } else if (Math.abs(changePercent) <= Math.abs(threshold.warning[1])) {
      return 'warning';
    } else {
      return 'critical';
    }
  }

  async getWeatherForecast(farmId) {
    // Intégration API météo (OpenWeatherMap, etc.)
    // Pour l'instant, retour simulé
    return {
      next7Days: [
        { day: 1, temp: 25, rain: 0, humidity: 60 },
        { day: 2, temp: 28, rain: 5, humidity: 65 },
        // ...
      ]
    };
  }
}

module.exports = new DataAggregatorService();