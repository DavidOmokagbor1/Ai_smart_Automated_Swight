import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  BoltIcon, 
  LightBulbIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { API_URL } from '../config';

const Statistics = () => {
  const [stats, setStats] = useState({
    currentMonth: {
      energyUsed: 0,
      energySaved: 0,
      costSaved: 0,
      carbonReduced: 0,
      lightsOptimized: 0
    },
    yearly: {
      totalSaved: 0,
      energyReduction: 0,
      costReduction: 0,
      carbonFootprint: 0
    },
    comparison: {
      before: 0,
      after: 0,
      percentage: 0
    }
  });

  useEffect(() => {
    // Fetch statistics from backend
    const fetchStatistics = async () => {
      try {
        const response = await fetch(`${API_URL}/api/statistics`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            currentMonth: {
              energyUsed: data.current_month.energy_used,
              energySaved: data.current_month.energy_saved,
              costSaved: data.current_month.cost_saved,
              carbonReduced: data.current_month.carbon_reduced,
              lightsOptimized: data.current_month.lights_optimized
            },
            yearly: {
              totalSaved: data.yearly.total_saved,
              energyReduction: data.yearly.energy_reduction,
              costReduction: data.yearly.cost_reduction,
              carbonFootprint: data.yearly.carbon_footprint
            },
            comparison: {
              before: data.comparison.before,
              after: data.comparison.after,
              percentage: data.comparison.percentage
            }
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to demo data
        setStats({
          currentMonth: {
            energyUsed: 245.6,
            energySaved: 98.2,
            costSaved: 156.80,
            carbonReduced: 45.2,
            lightsOptimized: 12
          },
          yearly: {
            totalSaved: 1845.60,
            energyReduction: 1178.4,
            costReduction: 35.2,
            carbonFootprint: 542.4
          },
          comparison: {
            before: 343.8,
            after: 245.6,
            percentage: 28.6
          }
        });
      }
    };

    fetchStatistics();
  }, []);

  const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <span className="text-3xl font-bold">
        {prefix}{displayValue.toFixed(decimals)}{suffix}
      </span>
    );
  };

  return (
    <div className="p-6 bg-[#23272f] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">📊 Energy Statistics & Savings</h1>
        <p className="text-[#e5e7eb] mt-2">
          Real impact of AI Smart Light Control on your family's energy consumption and costs
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Monthly Savings</p>
              <AnimatedNumber value={stats.currentMonth.costSaved} prefix="$" decimals={2} />
            </div>
            <CurrencyDollarIcon className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Energy Saved</p>
              <AnimatedNumber value={stats.currentMonth.energySaved} suffix=" kWh" decimals={1} />
            </div>
            <BoltIcon className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Carbon Reduced</p>
              <AnimatedNumber value={stats.currentMonth.carbonReduced} suffix=" kg" decimals={1} />
            </div>
            <LightBulbIcon className="w-8 h-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Lights Optimized</p>
              <AnimatedNumber value={stats.currentMonth.lightsOptimized} suffix="" decimals={0} />
            </div>
            <HomeIcon className="w-8 h-8" />
          </div>
        </motion.div>
      </div>

      {/* Annual Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4">💰 Annual Financial Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Savings:</span>
              <span className="font-bold">${stats.yearly.totalSaved}</span>
            </div>
            <div className="flex justify-between">
              <span>Energy Reduction:</span>
              <span className="font-bold">{stats.yearly.energyReduction} kWh</span>
            </div>
            <div className="flex justify-between">
              <span>Cost Reduction:</span>
              <span className="font-bold">{stats.yearly.costReduction}%</span>
            </div>
            <div className="flex justify-between">
              <span>ROI Period:</span>
              <span className="font-bold">6-8 months</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4">🌍 Environmental Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Carbon Reduced:</span>
              <span className="font-bold">{stats.yearly.carbonFootprint} kg CO2</span>
            </div>
            <div className="flex justify-between">
              <span>Trees Equivalent:</span>
              <span className="font-bold">2.7 trees</span>
            </div>
            <div className="flex justify-between">
              <span>Car Miles Saved:</span>
              <span className="font-bold">1,200 miles</span>
            </div>
            <div className="flex justify-between">
              <span>Environmental Score:</span>
              <span className="font-bold">A+</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Family Benefits */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">👨‍👩‍👧‍👦 Family Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2d3340] border border-[#363b47] rounded-2xl p-6"
          >
            <div className="text-center">
              <CurrencyDollarIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Financial Freedom</h4>
              <p className="text-[#a1a1aa]">
                Save ${stats.currentMonth.costSaved} monthly - that's ${stats.yearly.totalSaved} annually for family activities, education, or savings.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#2d3340] border border-[#363b47] rounded-2xl p-6"
          >
            <div className="text-center">
              <LightBulbIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Eco-Friendly Home</h4>
              <p className="text-[#a1a1aa]">
                Reduce your family's carbon footprint by {stats.currentMonth.carbonReduced}kg monthly. Teach children about sustainability.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#2d3340] border border-[#363b47] rounded-2xl p-6"
          >
            <div className="text-center">
              <HomeIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Smart Convenience</h4>
              <p className="text-[#a1a1aa]">
                Automated lighting that adapts to your family's schedule. No more forgotten lights or wasted energy.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-2xl text-center"
      >
        <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Home?</h3>
        <p className="text-lg mb-6">
          Join thousands of families already saving money and protecting the environment with AI Smart Light Control.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">${stats.currentMonth.costSaved}</p>
            <p className="text-sm">Monthly Savings</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.comparison.percentage}%</p>
            <p className="text-sm">Energy Reduction</p>
          </div>
          <div>
            <p className="text-3xl font-bold">6-8</p>
            <p className="text-sm">Month ROI</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Statistics; 