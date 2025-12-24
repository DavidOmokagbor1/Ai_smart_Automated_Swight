import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config';
import { VictoryChart, VictoryBar, VictoryPie, VictoryArea, VictoryTheme } from 'victory-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [statistics, setStatistics] = useState(null);
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchEnergyData();
  }, []);

  const fetchEnergyData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/status`);
      if (response.ok) {
        const data = await response.json();
        setEnergyData(data.energy);
      }
    } catch (error) {
      console.error('Error fetching energy data:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/statistics`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        // Use fallback data
        setStatistics({
          current_month: {
            energy_used: 245.6,
            energy_saved: 98.2,
            cost_saved: 156.80,
            carbon_reduced: 45.2,
            lights_optimized: 12
          },
          yearly: {
            total_saved: 1845.60,
            energy_reduction: 28.5,
            cost_reduction: 35.2,
            carbon_footprint: 542.4
          },
          comparison: {
            before: 343.8,
            after: 245.6,
            percentage: 28.6
          }
        });
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Use fallback data
      setStatistics({
        current_month: {
          energy_used: 245.6,
          energy_saved: 98.2,
          cost_saved: 156.80,
          carbon_reduced: 45.2,
          lights_optimized: 12
        },
        yearly: {
          total_saved: 1845.60,
          energy_reduction: 28.5,
          cost_reduction: 35.2,
          carbon_footprint: 542.4
        },
        comparison: {
          before: 343.8,
          after: 245.6,
          percentage: 28.6
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  const currentMonth = statistics?.current_month || {};
  const yearly = statistics?.yearly || {};
  const comparison = statistics?.comparison || {};

  // Calculate efficiency rating from daily consumption
  const usage = energyData?.daily_consumption || 0;
  let rating = 'A+';
  if (usage >= 30) rating = 'F';
  else if (usage >= 25) rating = 'E';
  else if (usage >= 20) rating = 'D';
  else if (usage >= 15) rating = 'C';
  else if (usage >= 10) rating = 'B';
  else if (usage >= 5) rating = 'A';

  const ratingColor = {
    'A+': '#10b981',
    'A': '#22c55e',
    'B': '#eab308',
    'C': '#f59e0b',
    'D': '#f97316',
    'E': '#ef4444',
    'F': '#dc2626',
  }[rating];

  // Chart data
  const monthlyData = [
    { x: 'Used', y: currentMonth.energy_used || 0 },
    { x: 'Saved', y: currentMonth.energy_saved || 0 },
  ];

  const pieData = [
    { x: 'Used', y: currentMonth.energy_used || 0 },
    { x: 'Saved', y: currentMonth.energy_saved || 0 },
  ];

  // Energy usage history chart
  const usageHistory = energyData?.usage_history || [];
  const chartData = usageHistory.slice(-24).map((entry, index) => ({
    x: index,
    y: entry.consumption || 0,
  }));

  return (
    <ScrollView style={styles.container}>
      {/* Today's Energy Overview */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Ionicons name="flash" size={32} color="#F59E0B" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Today's Energy</Text>
            <Text style={styles.cardSubtitle}>Daily Consumption</Text>
          </View>
        </View>
        <Text style={styles.todayEnergyValue}>
          {energyData?.daily_consumption?.toFixed(2) || '0.00'} kWh
        </Text>
        <View style={styles.insightsGrid}>
          <View style={[styles.insightCard, { backgroundColor: '#3b82f6' }]}>
            <Ionicons name="flash" size={24} color="#FCD34D" />
            <Text style={styles.insightTitle}>Today's Energy</Text>
            <Text style={styles.insightValue}>
              {energyData?.daily_consumption?.toFixed(2) || '0'} kWh
            </Text>
          </View>
          
          <View style={[styles.insightCard, { backgroundColor: '#10b981' }]}>
            <Ionicons name="stats-chart" size={24} color="#D1FAE5" />
            <Text style={styles.insightTitle}>Efficiency</Text>
            <Text style={styles.insightValue}>{rating}</Text>
          </View>
          
          <View style={[styles.insightCard, { backgroundColor: '#8b5cf6' }]}>
            <Ionicons name="cash" size={24} color="#E9D5FF" />
            <Text style={styles.insightTitle}>Cost Saved</Text>
            <Text style={styles.insightValue}>
              ${energyData?.cost_saved?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Energy Efficiency Rating */}
      <View style={styles.card}>
        <View style={styles.efficiencyHeader}>
          <Text style={styles.cardTitle}>Energy Efficiency Rating</Text>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
        </View>
        <View style={styles.efficiencyContent}>
          <Text style={[styles.efficiencyRating, { color: ratingColor }]}>{rating}</Text>
          <View style={styles.efficiencyBar}>
            <View 
              style={[
                styles.efficiencyFill,
                { width: `${Math.min((usage / 40) * 100, 100)}%`, backgroundColor: ratingColor }
              ]} 
            />
          </View>
          <Text style={styles.efficiencyText}>
            {usage.toFixed(2)} kWh / 40 kWh
          </Text>
          <Text style={styles.efficiencySubtext}>
            Lower is better. Based on daily consumption.
          </Text>
        </View>
      </View>

      {/* Energy Usage Chart */}
      {chartData.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Energy Usage</Text>
          <View style={styles.chartContainer}>
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
            >
              <VictoryArea
                data={chartData}
                style={{
                  data: { fill: '#3b82f6', fillOpacity: 0.3, stroke: '#3b82f6', strokeWidth: 2 }
                }}
              />
            </VictoryChart>
          </View>
        </View>
      )}

      {/* Monthly Savings */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Ionicons name="cash" size={32} color="#10b981" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Monthly Savings</Text>
            <Text style={styles.cardSubtitle}>This Month</Text>
          </View>
        </View>
        <Text style={styles.amount}>${currentMonth.cost_saved?.toFixed(2) || '156.80'}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentMonth.energy_saved?.toFixed(1) || '98.2'} kWh</Text>
            <Text style={styles.statLabel}>Energy Saved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{currentMonth.carbon_reduced?.toFixed(1) || '45.2'} kg</Text>
            <Text style={styles.statLabel}>CO₂ Reduced</Text>
          </View>
        </View>
      </View>

      {/* Yearly Impact */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Ionicons name="calendar" size={32} color="#6366f1" />
          </View>
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>Yearly Impact</Text>
            <Text style={styles.cardSubtitle}>Annual Savings</Text>
          </View>
        </View>
        <Text style={styles.yearlyAmount}>${yearly.total_saved?.toFixed(2) || '1845.60'}</Text>
        <View style={styles.yearlyStats}>
          <View style={styles.yearlyItem}>
            <Ionicons name="flash" size={20} color="#F59E0B" />
            <Text style={styles.yearlyValue}>{yearly.energy_reduction?.toFixed(1) || '28.5'}%</Text>
            <Text style={styles.yearlyLabel}>Energy Reduction</Text>
          </View>
          <View style={styles.yearlyItem}>
            <Ionicons name="leaf" size={20} color="#10b981" />
            <Text style={styles.yearlyValue}>{yearly.carbon_footprint?.toFixed(1) || '542.4'} kg</Text>
            <Text style={styles.yearlyLabel}>Carbon Footprint</Text>
          </View>
        </View>
      </View>

      {/* Comparison */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
            <Ionicons name="stats-chart" size={32} color="#8b5cf6" />
          </View>
          <Text style={styles.cardTitle}>Energy Comparison</Text>
        </View>
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Before</Text>
            <Text style={styles.comparisonValue}>{comparison.before?.toFixed(1) || '343.8'} kWh</Text>
          </View>
          <View style={styles.comparisonArrow}>
            <Ionicons name="arrow-forward" size={24} color="#6366f1" />
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>After</Text>
            <Text style={[styles.comparisonValue, { color: '#10b981' }]}>
              {comparison.after?.toFixed(1) || '245.6'} kWh
            </Text>
          </View>
        </View>
        <View style={styles.percentageBadge}>
          <Text style={styles.percentageText}>
            {comparison.percentage?.toFixed(1) || '28.6'}% Reduction
          </Text>
        </View>
      </View>

      {/* Energy Distribution Chart */}
      {pieData.some(d => d.y > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Energy Distribution</Text>
          <View style={styles.chartContainer}>
            <VictoryPie
              data={pieData}
              width={width - 80}
              height={250}
              colorScale={['#ef4444', '#10b981']}
              innerRadius={50}
              labelRadius={({ innerRadius }) => innerRadius + 20}
              style={{
                labels: { fill: '#fafafa', fontSize: 14, fontWeight: 'bold' }
              }}
            />
          </View>
        </View>
      )}

      {/* Usage Chart */}
      {monthlyData.some(d => d.y > 0) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Usage</Text>
          <View style={styles.chartContainer}>
            <VictoryChart
              theme={VictoryTheme.material}
              width={width - 80}
              height={200}
            >
              <VictoryBar
                data={monthlyData}
                style={{
                  data: {
                    fill: ({ datum }) => datum.x === 'Used' ? '#ef4444' : '#10b981',
                  }
                }}
              />
            </VictoryChart>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0f',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#111118',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 20,
  },
  yearlyAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  yearlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  yearlyItem: {
    alignItems: 'center',
  },
  yearlyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fafafa',
    marginTop: 8,
  },
  yearlyLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fafafa',
  },
  comparisonArrow: {
    paddingHorizontal: 16,
  },
  percentageBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  todayEnergyValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 20,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  insightCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  insightTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  efficiencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  efficiencyContent: {
    gap: 12,
  },
  efficiencyRating: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  efficiencyBar: {
    height: 8,
    backgroundColor: '#2d3340',
    borderRadius: 4,
    overflow: 'hidden',
  },
  efficiencyFill: {
    height: '100%',
    borderRadius: 4,
  },
  efficiencyText: {
    fontSize: 14,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  efficiencySubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default StatisticsScreen;






