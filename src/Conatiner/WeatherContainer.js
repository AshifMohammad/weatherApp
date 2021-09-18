import React from "react";
import axios from "axios"
import "./styles.css"


export default class WeatherContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            location: "ottawa",
            locations: ["ottawa", "moscow", "tokyo"],
            days: [],
            daysFull: [],
            temps: [],
            minTemps: [],
            maxTemps: [],
            weather: [],
            icons: [],
            displayIndex: 0
        };
    }

    fetchData = () => {
        const url = this.buildUrlApi();
        console.log("api", url);

        axios.get(url).then(response => {
            this.setState({
                data: response.data
            });

            const currentData = this.currentData();
            const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dayOfWeekFull = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
            ];
            const currentDayFull =
                dayOfWeekFull[new Date(currentData.dt_txt).getDay()];
            const currentTemp = Math.round(currentData.main.temp);
            const currentMinTemp = Math.round(currentData.main.temp_min);
            const currentMaxTemp = Math.round(currentData.main.temp_max);
            const currentWeather =
                currentData.weather[0].main === "Clouds"
                    ? "Cloudy"
                    : currentData.weather[0].main;
            const currentIcon = this.convertWeatherIcons(currentData.weather[0].main);

            const days = [];
            const daysFull = [];
            const temps = [];
            const minTemps = [];
            const maxTemps = [];
            const weather = [];
            const icons = [];
            for (let i = 0; i < this.state.data.list.length; i = i + 8) {
                let date = new Date(this.state.data.list[i].dt_txt);
                let day = dayOfWeek[date.getDay()];
                let dayFull = dayOfWeekFull[date.getDay()];
                days.push(day);
                daysFull.push(dayFull);
                temps.push(Math.round(this.state.data.list[i].main.temp));
                minTemps.push(Math.round(this.state.data.list[i].main.temp_min));
                maxTemps.push(Math.round(this.state.data.list[i].main.temp_max));

                if (this.state.data.list[i].weather[0].main === "Clouds") {
                    weather.push("Cloudy");
                } else {
                    weather.push(this.state.data.list[i].weather[0].main);
                }

                icons.push(
                    this.convertWeatherIcons(this.state.data.list[i].weather[0].main)
                );
            }

            this.setState({
                days: [...days.slice(1)],
                daysFull: [currentDayFull, ...daysFull.slice(1)],
                temps: [currentTemp, ...temps.slice(1)],
                minTemps: [currentMinTemp, ...minTemps.slice(1)],
                maxTemps: [currentMaxTemp, ...maxTemps.slice(1)],
                weather: [currentWeather, ...weather.slice(1)],
                icons: [currentIcon, ...icons.slice(1)]
            });
        });
    };

    buildUrlApi = () => {
        const location = encodeURIComponent(this.state.location);
        const urlPrefix = "https://api.openweathermap.org/data/2.5/forecast?q=";
        const urlSuffix = "&APPID=fb1158dc7dfef5f0967ceac8f71ee3a6&units=metric";

        return [urlPrefix, location, urlSuffix].join("");
    };

    currentData = () => {
        const list = this.state.data.list;
        const nearestHr = this.computeNearestHr();

        return list.find(e => new Date(e.dt_txt).getHours() === nearestHr);
    };

    computeNearestHr = () => {
        const currentTimeInHrs = new Date().getHours();
        const constHrs = [0, 3, 6, 9, 12, 15, 18, 21];
        const differences = constHrs.map(e => Math.abs(e - currentTimeInHrs));
        const indexofLowestDiff = differences.indexOf(Math.min(...differences));

        return constHrs[indexofLowestDiff];
    };

    convertWeatherIcons = weather => {
        switch (weather) {
            case "Clear":
                return "circle-outline";
            case "Clouds":
                return "weather-cloudy";
            case "Snow":
                return "weather-snowy";
            case "Rain":
                return "weather-pouring";
            case "Drizzle":
                return "weather-pouring";
            case "Thunderstorm":
                return "weather-lightning-rainy";
            default:
                return "weather-cloudy";
        }
    };

    componentDidMount() {
        this.fetchData();
    }

    handleFocus = e => {
        e.target.select();
    }

    changeLocation = (location) => {
        this.setState(
            {
                location
            },
            () => {
                this.fetchData();
            }
        );
    };

    setIndex = index => {
        this.setState({
            displayIndex: index
        });
    };

    render() {
        const {
            location,
            days,
            temps,
            weather,
            icons,
            displayIndex
        } = this.state;
        let background = "";
        switch (weather[displayIndex]) {
            case "Clear":
                background = "clear";
                break;
            case "Cloudy":
                background = "cloudy";
                break;
            case "Snow":
                background = "snow";
                break;
            case "Rain":
                background = "rain";
                break;
            case "Drizzle":
                background = "rain";
                break;
            case "Thunderstorm":
                background = "thunderstorm";
                break;
            default:
                background = "cloudy";
        }

        return (
            <div className="main-weather-container">
                <div className="cities">
                    {this.state.locations.map((city, key) => {
                        return <div key={key} onClick={() => this.changeLocation(city)} id={city}
                                    className={location === city ? "city active-city" : "city"}>{city}</div>
                    })}
                </div>
                <div className={"weather-container widget ".concat(...background)}>
                    <div className="main-display">
                        <div>Today</div>
                        <div className="main-info">
                            <i className={"mdi mdi-".concat(icons[0])} style={{fontSize: "5rem"}}/>
                            <div className="temp-measurement ">{temps[displayIndex]}</div>
                            <i className="temp-unit mdi mdi-temperature-celsius"/>
                        </div>

                        <h3 style={{margin: "0 0 10px 0 "}}>
                            {`${weather[0]}`} {/* today weather*/}
                        </h3>
                    </div>

                    <div className="selection-panel">

                        <div className="selection-row">
                            {days.map((item, index) => {
                                return (
                                    <div
                                        className="selection-days"
                                        key={index + 1}
                                    >
                                        <div>
                                            {item}
                                        </div>
                                        <i className={`day-icon mdi mdi-${icons[index]}`}/>
                                        <div>{this.state.temps[index]}<i className="mdi mdi-temperature-celsius"/></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

