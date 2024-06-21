import { Chart } from 'chart.js';

let batchLossCtx, batchAccCtx, epochLossCtx, epochAccCtx;
let batchLossChart, batchAccChart, epochLossChart, epochAccChart;

window.onload = function() {
    batchLossCtx = document.getElementById('batchLossChart');
    batchAccCtx = document.getElementById('batchAccChart');
    epochLossCtx = document.getElementById('epochLossChart');
    epochAccCtx = document.getElementById('epochAccChart');

    batchLossChart = new Chart(batchLossCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Loss',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }]
        },
        options: {
            legend: false,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Batch'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Loss'
                    }
                }
            },
        }
    });

    batchAccChart = new Chart(batchAccCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Accuracy',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }]
        },
        options: {
            legend: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Batch'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Accuracy'
                    }
                }
            },
        }

    });

    epochLossChart = new Chart(epochLossCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Loss',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }, {
                label: 'Valid Loss',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }]
        },
        options: {
            legend: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Epoch'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Loss'
                    }
                }
            },
        }

    });

    epochAccChart = new Chart(epochAccCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Accuracy',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            }, {
                label: 'Valid Accuracy',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }]
        },
        options: {
            legend: true,
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Epoch'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Accuracy'
                    }
                }
            },
        }

    });
};

export { batchLossChart, batchAccChart, epochLossChart, epochAccChart };