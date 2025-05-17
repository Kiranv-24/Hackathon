import React, { useState } from "react";
import { Link } from "react-router-dom";
import Pencil from "../../assets/pencil.png";
import View from "../../assets/analysis.png";
import Searchbox from "../SearchBox";
import { Bar } from "react-chartjs-2";
import { Line } from "react-chartjs-2";
import { Doughnut } from "react-chartjs-2";
import { useTranslation } from "react-i18next";

import { Chart as chartjs } from "chart.js/auto";
import LeadersList from "./LeaderList";

const navigationLink = [
  {
    name: "sidebar_personal_meetings",
    path: "/mentor/meetings",
    icons: Pencil,
  },
  {
    name: "sidebar_tests",
    path: "/mentor/my-test",
    icons: Pencil,
  },
  {
    name: "sidebar_discuss",
    path: "user/discuss",
    icons: Pencil,
  },
  {
    name: "dashboard_created_course",
    path: "/mentor/material",
    icons: Pencil,
  },
  {
    name: "dashboard_materials",
    path: "/mentor/material",
    icons: Pencil,
  },
  {
    name: "sidebar_newsfeed",
    path: "/mentor/meetings",
    icons: Pencil,
  },
];
const classReport = [
  {
    class: 3,
    performance: 40,
    color: "red",
  },
  {
    class: 4,
    performance: 60,
    color: "yellow",
  },
  {
    class: 5,
    performance: 20,
    color: "red",
  },

  {
    class: 7,
    performance: 60,
    color: "orange",
  },

  {
    class: 9,
    performance: 60,
    color: "orange",
  },
  {
    class: 10,
    performance: 80,
    color: "green",
  },

  {
    class: 12,
    performance: 10,
    color: "yellow",
  },
];
const class1 = [
  {
    month: "Jan",
    performance: 40,
  },
  {
    month: "Feb",
    performance: 20,
  },

  {
    month: "Mar",
    performance: 40,
  },
  {
    month: "Apr",
    performance: 10,
  },
  {
    month: "May",
    performance: 30,
  },
  {
    month: "Jun",
    performance: 90,
  },
  {
    month: "Jul",
    performance: 10,
  },
  {
    month: "Aug",
    performance: 40,
  },
  {
    month: "Sep",
    performance: 20,
  },
  {
    month: "Oct",
    performance: 80,
  },
  {
    month: "Nov",
    performance: 60,
  },
  {
    month: "Dec",
    performance: 40,
  },
];

const options = {
  scales: {
    x: {
      grid: {
        display: true,
      },
      ticks: {
        stepSize: 9,
      },
    },
    y: {
      beginAtZero: true,
    },
  },
};
const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Leaderboard = () => {
  const { t } = useTranslation();
  
  const [chartData, setChartData] = useState({
    labels: classReport.map((data) => data.class),
    datasets: [
      {
        label: t("chart_class_performance"),
        data: classReport.map((data) => data.performance),
        backgroundColor: classReport.map((data) => data.color),

        barPercentage: 0.9,
      },
    ],
  });
  const [chartAnalysis, setChartAnalysis] = useState({
    labels: month.map(m => t(`months_${m.toLowerCase()}`)),
    datasets: [
      {
        label: t("chart_class"),
        data: class1.map((data) => data.performance),
        borderColour: "red",
        suggestedMin: 0,
        suggestedMax: 25,
      },
    ],
  });

  return (
    <div>
      <div>
        <h1>Leaderboard</h1>
      </div>
    </div>
  );
};

export default Leaderboard;
