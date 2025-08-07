const PLANT_DATABASE = [
    {
        name: "Tomate Cereja",
        idealTemp: { min: 18, max: 28 },
        idealRainfall: { min: 50, max: 150 },
        idealHumidity: { min: 60, max: 80 },
        spaceNeeded: "medium",
        harvestTime: "60-80 dias",
        image: "Imagens/tomateceveja.jpg",
        tips: ["Regar a cada 2 dias", "Necessita de sol pleno", "Adubar a cada 15 dias"],
        sunExposure: "full"
    },
    {
        name: "Manjericão",
        idealTemp: { min: 15, max: 30 },
        idealRainfall: { min: 30, max: 120 },
        idealHumidity: { min: 50, max: 85 },
        spaceNeeded: "small",
        harvestTime: "30-60 dias",
        image: "Imagens/manjericao.png",
        tips: ["Regar diariamente", "Proteger do vento forte", "Podar regularmente"],
        sunExposure: "partial"
    },
    {
        name: "Alface Crespa",
        idealTemp: { min: 10, max: 25 },
        idealRainfall: { min: 60, max: 200 },
        idealHumidity: { min: 70, max: 90 },
        spaceNeeded: "small",
        harvestTime: "40-50 dias",
        image: "Imagens/alface.png",
        tips: ["Manter solo úmido", "Colher folhas externas primeiro", "Plantar em local fresco"],
        sunExposure: "partial"
    },
    {
        name: "Pimenta Calabresa",
        idealTemp: { min: 20, max: 32 },
        idealRainfall: { min: 40, max: 100 },
        idealHumidity: { min: 50, max: 70 },
        spaceNeeded: "medium",
        harvestTime: "70-90 dias",
        image: "Imagens/pimenta.png",
        tips: ["Sol pleno", "Regar quando solo estiver seco", "Suporte para crescimento"],
        sunExposure: "full"
    },
    {
        name: "Cenoura",
        idealTemp: { min: 15, max: 25 },
        idealRainfall: { min: 50, max: 150 },
        idealHumidity: { min: 60, max: 80 },
        spaceNeeded: "medium",
        harvestTime: "70-100 dias",
        image: "Imagens/cenoura.png",
        tips: ["Solo solto e arenoso", "Regar regularmente", "Desbastar mudas"],
        sunExposure: "full"
    },
    {
        name: "Hortelã",
        idealTemp: { min: 12, max: 28 },
        idealRainfall: { min: 40, max: 180 },
        idealHumidity: { min: 65, max: 85 },
        spaceNeeded: "small",
        harvestTime: "60-90 dias",
        image: "Imagens/hortela.png",
        tips: ["Melhor em vasos separados", "Manter solo úmido", "Podar regularmente"],
        sunExposure: "partial"
    }
];

let selectedLat = null;
let selectedLon = null;
const OPENWEATHER_API_KEY = "6ec5ac7a1c9e25dc52ebcde8522746cd";
// Chave de teste - substitua pela sua

// Função principal para buscar dados climáticos
async function fetchClimateDataFromOpenWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Falha ao obter dados da OpenWeather");
        const data = await response.json();
        
        // Processar os dados para o formato que precisamos
        const dailyData = [];
        const days = {};
        
        // Agrupar por dia (a API retorna dados de 3 horas)
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            if (!days[dateStr]) {
                days[dateStr] = {
                    date: date,
                    temp: [],
                    rain: 0,
                    humidity: []
                };
            }
            
            days[dateStr].temp.push(item.main.temp);
            days[dateStr].rain += item.rain ? item.rain['3h'] || 0 : 0;
            days[dateStr].humidity.push(item.main.humidity);
        });
        
        // Calcular médias diárias
        for (const dateStr in days) {
            const day = days[dateStr];
            dailyData.push({
                date: day.date,
                temp: day.temp.reduce((a, b) => a + b, 0) / day.temp.length,
                rain: day.rain,
                humidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length
            });
        }
        
        // Calcular médias gerais
        const averages = {
            temp: dailyData.reduce((sum, day) => sum + day.temp, 0) / dailyData.length,
            rain: dailyData.reduce((sum, day) => sum + day.rain, 0) / dailyData.length,
            humidity: dailyData.reduce((sum, day) => sum + day.humidity, 0) / dailyData.length
        };
        
        return {
            dailyData: dailyData,
            averages: averages
        };
        
    } catch (error) {
        console.error("Erro na OpenWeather:", error);
        throw error;
    }
}

// Função para simular dados climáticos (fallback)
function simulateWeatherData(lat, lon) {
    const dailyData = [];
    const today = new Date();
    
    // Baseado na latitude para variação sazonal mais realista
    const isNorthern = lat > 0;
    const seasonalOffset = isNorthern ? 
        (today.getMonth() / 12 * Math.PI * 2) : 
        ((today.getMonth() + 6) / 12 * Math.PI * 2);
    
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Variação sazonal mais realista
        const seasonalVar = Math.sin(seasonalOffset + i/14 * Math.PI) * 8;
        
        // Base temperature based on latitude
        const baseTemp = 25 - (Math.abs(lat) / 3);
        
        dailyData.push({
            date: date,
            temp: baseTemp + seasonalVar + (Math.random() * 4 - 2),
            rain: Math.max(0, (Math.random() * 10 + seasonalVar/3).toFixed(1)),
            humidity: 60 + seasonalVar/2 + (Math.random() * 15 - 7.5)
        });
    }
    
    return {
        dailyData: dailyData,
        averages: {
            temp: dailyData.reduce((sum, day) => sum + day.temp, 0) / dailyData.length,
            rain: dailyData.reduce((sum, day) => sum + day.rain, 0) / dailyData.length,
            humidity: dailyData.reduce((sum, day) => sum + day.humidity, 0) / dailyData.length
        }
    };
}

// Função para verificar condições de plantio
function getPlantingStatus(day) {
    const tempOk = day.temp >= 15 && day.temp <= 30;
    const rainOk = day.rain >= 1 && day.rain <= 20;
    const humidityOk = day.humidity >= 50 && day.humidity <= 85;

    if (tempOk && rainOk && humidityOk) return { status: 'good', text: 'Bom para plantar' };
    if (day.temp < 5 || day.temp > 35 || day.humidity < 30) return { status: 'bad', text: 'Não plantar' };
    return { status: 'neutral', text: 'Condições regulares' };
}

// Função para gerar recomendações de plantas (atualizada)
function generatePlantRecommendations(weatherData, spaceType) {
    const { averages } = weatherData;
    
    if (!averages || isNaN(averages.temp) || isNaN(averages.rain) || isNaN(averages.humidity)) {
        return [];
    }

    // Primeira tentativa: critérios estritos
    let recommendations = PLANT_DATABASE.filter(plant => {
        const tempOk = averages.temp >= plant.idealTemp.min && averages.temp <= plant.idealTemp.max;
        const rainOk = averages.rain >= plant.idealRainfall.min && averages.rain <= plant.idealRainfall.max;
        const humidityOk = averages.humidity >= plant.idealHumidity.min && averages.humidity <= plant.idealHumidity.max;
        const spaceOk = (spaceType === "small" && plant.spaceNeeded === "small") ||
                       (spaceType === "medium" && (plant.spaceNeeded === "small" || plant.spaceNeeded === "medium")) ||
                       (spaceType === "large");
        return tempOk && rainOk && humidityOk && spaceOk;
    });

    // Se nenhuma planta for encontrada, relaxar os critérios
    if (recommendations.length === 0) {
        recommendations = PLANT_DATABASE.filter(plant => {
            const tempMargin = 2; // graus de margem
            const rainMargin = 10; // mm de margem
            const humidityMargin = 5; // % de margem
            
            const tempClose = (averages.temp >= plant.idealTemp.min - tempMargin && 
                             averages.temp <= plant.idealTemp.max + tempMargin);
            const rainClose = (averages.rain >= plant.idealRainfall.min - rainMargin && 
                              averages.rain <= plant.idealRainfall.max + rainMargin);
            const humidityClose = (averages.humidity >= plant.idealHumidity.min - humidityMargin && 
                                 averages.humidity <= plant.idealHumidity.max + humidityMargin);
            
            const spaceOk = (spaceType === "small" && plant.spaceNeeded === "small") ||
                           (spaceType === "medium" && (plant.spaceNeeded === "small" || plant.spaceNeeded === "medium")) ||
                           (spaceType === "large");
            
            return (tempClose || rainClose || humidityClose) && spaceOk;
        });

        // Marcar plantas como "condições subótimas"
        if (recommendations.length > 0) {
            recommendations.forEach(plant => {
                plant.suboptimal = true;
                plant.additionalTips = ["Esta planta pode não ter o desempenho ideal nas condições atuais, mas pode ser cultivada com cuidados extras."];
            });
        }
    }

    return recommendations;
}

// Função para renderizar o gráfico climático
function renderClimateChart(dailyData) {
    const labels = dailyData.map(day => 
        new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    );
    
    const ctx = document.getElementById('climateChart').getContext('2d');
    
    if (window.climateChart instanceof Chart) window.climateChart.destroy();
    
    window.climateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: dailyData.map(day => day.temp),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3
                },
                {
                    label: 'Precipitação (mm)',
                    data: dailyData.map(day => day.rain),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3
                },
                {
                    label: 'Umidade (%)',
                    data: dailyData.map(day => day.humidity),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    yAxisID: 'y2',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            scales: {
                y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Temperatura (°C)' } },
                y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Precipitação (mm)' } },
                y2: { type: 'linear', display: false }
            }
        }
    });
}

// Função para renderizar o calendário de plantio
function renderPlantingCalendar(dailyData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calendarContainer = document.getElementById('planting-calendar');
    calendarContainer.innerHTML = '';
    
    dailyData.slice(0, 14).forEach(day => {
        const dayDate = new Date(day.date);
        const isToday = dayDate.toDateString() === today.toDateString();
        const { status, text } = getPlantingStatus(day);
        
        let weatherIcon;
        if (day.rain > 5) weatherIcon = '🌧️';
        else if (day.temp > 28) weatherIcon = '☀️';
        else if (day.temp < 15) weatherIcon = '❄️';
        else weatherIcon = '⛅';
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${status}-planting ${isToday ? 'current-day' : ''}`;
        dayElement.innerHTML = `
            <div class="d-flex justify-content-between">
                <small class="fw-bold">${dayDate.getDate()}/${dayDate.getMonth() + 1}</small>
                <span>${weatherIcon}</span>
            </div>
            <small class="d-block mt-1">${day.temp.toFixed(1)}°C</small>
            <small class="d-block">${day.rain.toFixed(1)}mm</small>
            <div class="planting-status">${text}</div>
        `;
        calendarContainer.appendChild(dayElement);
    });
}

// Função para renderizar as recomendações de plantas (atualizada)
function renderPlantRecommendations(plants) {
    const container = document.getElementById('plants-container');
    
    if (plants.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    Nenhuma planta recomendada para as condições atuais. 
                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="showAllPlants()">
                        Mostrar todas as plantas com dicas de cultivo
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = plants.map(plant => `
        <div class="col-md-6 col-lg-4">
            <div class="card card-plant h-100 ${plant.suboptimal ? 'border-warning' : ''}">
                ${plant.suboptimal ? 
                    '<div class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">Condições subótimas</div>' : ''}
                <img src="${plant.image}" class="card-img-top" alt="${plant.name}" style="height: 180px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${plant.name}</h5>
                    <p class="card-text"><small class="text-muted">Colheita em ${plant.harvestTime}</small></p>
                    <ul class="small">
                        ${plant.tips.map(tip => `<li>${tip}</li>`).join('')}
                        ${plant.additionalTips ? plant.additionalTips.map(tip => `<li class="text-warning">${tip}</li>`).join('') : ''}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
}

// Função para mostrar todas as plantas quando não há recomendações
function showAllPlants() {
    const allPlants = PLANT_DATABASE.map(plant => {
        return {
            ...plant,
            suboptimal: true,
            additionalTips: ["Esta planta não é ideal para as condições atuais, mas pode ser cultivada com cuidados extras."]
        };
    });
    renderPlantRecommendations(allPlants);
}

// Função para renderizar dicas personalizadas (atualizada)
function renderPersonalTips(averages, numRecommendations) {
    const tipsContainer = document.getElementById('personal-tips');
    const tips = [];

    if (!averages || isNaN(averages.temp) || isNaN(averages.rain) || isNaN(averages.humidity)) {
        tips.push("Não foi possível calcular as médias climáticas. Tente novamente mais tarde.");
    } else {
        // Dicas baseadas no clima
        if (averages.temp < 10) {
            tips.push("Temperaturas muito baixas - considere plantar em estufa ou usar coberturas de proteção");
        } else if (averages.temp < 15) {
            tips.push("Temperaturas baixas - plantas de clima frio podem se desenvolver melhor");
        } else if (averages.temp > 28) {
            tips.push("Temperaturas altas - regue no início da manhã ou final da tarde para evitar evaporação");
        } else if (averages.temp > 32) {
            tips.push("Temperaturas muito altas - considere sombreamento para proteger as plantas");
        }

        if (averages.rain < 5) {
            tips.push("Período seco - aumente a frequência de regas e considere usar cobertura morta");
        } else if (averages.rain > 15) {
            tips.push("Período chuvoso - verifique a drenagem do solo para evitar encharcamento");
        }

        if (averages.humidity < 40) {
            tips.push("Umidade muito baixa - pulverize água nas folhas nos horários mais frescos");
        } else if (averages.humidity > 85) {
            tips.push("Umidade muito alta - aumente a ventilação para evitar fungos");
        }

        // Dicas baseadas no número de recomendações
        if (numRecommendations > 3) {
            tips.push("Excelentes condições para diversas plantas!");
        } else if (numRecommendations === 0) {
            tips.push("Condições climáticas desafiadoras - considere plantas mais resistentes ou cultivo protegido");
        }
    }

    // Dicas gerais sempre úteis
    tips.push(
        "Melhor horário para regar: entre 6h e 10h da manhã",
        "Verifique sempre a umidade do solo antes de regar",
        "Adube suas plantas a cada 15-30 dias durante o período de crescimento"
    );

    tipsContainer.innerHTML = `
        <div class="alert ${numRecommendations > 0 ? 'alert-success' : 'alert-warning'}">
            <strong>${numRecommendations} plantas</strong> recomendadas para suas condições
        </div>
        <ul class="list-group list-group-flush">
            ${tips.map(tip => `
                <li class="list-group-item d-flex align-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                         class="bi ${numRecommendations > 0 ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'} me-2" 
                         viewBox="0 0 16 16">
                        ${numRecommendations > 0 ? 
                          '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>' :
                          '<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>'}
                    </svg>
                    ${tip}
                </li>
            `).join('')}
        </ul>
    `;
}

// Função para exibir resultados
function displayResults(weatherData, recommendations) {
    renderClimateChart(weatherData.dailyData);
    renderPlantingCalendar(weatherData.dailyData);
    renderPlantRecommendations(recommendations);
    renderPersonalTips(weatherData.averages, recommendations.length);
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('results-section').classList.remove('d-none');
}

// Funções para exibir mensagens de erro/aviso
function showError(message) {
    const alertsContainer = document.getElementById('alerts-container') || createAlertsContainer();
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `<strong>Erro:</strong> ${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    alertsContainer.appendChild(alertDiv);
}

function showWarning(message) {
    const alertsContainer = document.getElementById('alerts-container') || createAlertsContainer();
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-warning alert-dismissible fade show';
    alertDiv.innerHTML = `<strong>Aviso:</strong> ${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    alertsContainer.appendChild(alertDiv);
}

function createAlertsContainer() {
    const container = document.createElement('div');
    container.id = 'alerts-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Função para obter coordenadas geográficas
async function getCoordinates(location) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    try {
        const response = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
        if (!response.ok) throw new Error("Falha na requisição Nominatim");
        const results = await response.json();
        if (results && results.length > 0) return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
        throw new Error("Localização não encontrada");
    } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
        throw new Error("Não foi possível encontrar a localização. Verifique o nome e tente novamente.");
    }
}

// Função para detectar localização do usuário
function initLocationDetection() {
    document.getElementById('detect-location').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                selectedLat = position.coords.latitude;
                selectedLon = position.coords.longitude;
                document.getElementById('location-input').value = "Sua Localização Atual";
                
                const mapElement = document.getElementById('map');
                if (window.L && mapElement && mapElement._leaflet_id) {
                    const map = L.map.get(mapElement._leaflet_id);
                    if (map) {
                        map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
                        L.marker([selectedLat, selectedLon]).addTo(map);
                    }
                }
            }, error => {
                console.error("Erro ao obter localização:", error);
                alert("Não foi possível detectar sua localização. Por favor, digite sua cidade.");
            });
        } else {
            alert("Geolocalização não suportada pelo seu navegador. Por favor, digite sua cidade.");
        }
    });
}

// Função principal para obter recomendações
async function getRecommendations() {
    const button = document.getElementById('get-suggestions');
    const originalText = button.innerHTML;
    const spaceType = document.getElementById('space-type').value;

    try {
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processando...';

        const locationInput = document.getElementById('location-input').value;
        if (!locationInput) throw new Error("Por favor, informe sua localização");
        if (!spaceType) throw new Error("Por favor, selecione o tipo de espaço");

        let lat, lon;
        if (locationInput === 'Local selecionado no mapa' || locationInput === 'Sua Localização Atual') {
            if (!selectedLat || !selectedLon) throw new Error("Por favor, selecione uma localização no mapa");
            lat = selectedLat;
            lon = selectedLon;
        } else {
            const coords = await getCoordinates(locationInput);
            lat = coords.lat;
            lon = coords.lon;
        }

        let weatherData;
        try {
            weatherData = await fetchClimateDataFromOpenWeather(lat, lon);
        } catch (apiError) {
            console.warn("Usando dados simulados:", apiError);
            weatherData = simulateWeatherData(lat, lon);
        }

        const recommendations = generatePlantRecommendations(weatherData, spaceType);
        displayResults(weatherData, recommendations);

    } catch (error) {
        console.error("Erro:", error);
        showError(error.message);

        try {
            const fallbackData = simulateWeatherData(selectedLat || -23.55, selectedLon || -46.63);
            const recommendations = generatePlantRecommendations(fallbackData, spaceType);
            displayResults(fallbackData, recommendations);
            showWarning("Sistema usando dados simulados");
        } catch (fallbackError) {
            console.error("Erro no fallback:", fallbackError);
            showError("Não foi possível gerar recomendações");
        }
    } finally {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Inicialização do mapa
function initMap() {
    const mapElement = document.getElementById('map');
    if (window.L && mapElement) {
        if (mapElement._leaflet_id) {
            mapElement._leaflet_id = null;
            mapElement.innerHTML = "";
        }
        
        const map = L.map('map').setView([-23.55, -46.63], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        let marker;
        map.on('click', function(e) {
            selectedLat = e.latlng.lat;
            selectedLon = e.latlng.lng;
            if (marker) map.removeLayer(marker);
            marker = L.marker([selectedLat, selectedLon]).addTo(map);
            document.getElementById('location-input').value = 'Local selecionado no mapa';
        });
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Menu dropdown do perfil
    const profile = document.querySelector('.profile');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownIcon = document.querySelector('.dropdown-icon');

    profile.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
        dropdownIcon.classList.toggle('rotate');
    });

    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        dropdownIcon.classList.remove('rotate');
    });

    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Inicializações
    initLocationDetection();
    initMap();
    
    // Tooltips do Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Evento do botão de recomendações
    document.getElementById('get-suggestions').addEventListener('click', getRecommendations);
});