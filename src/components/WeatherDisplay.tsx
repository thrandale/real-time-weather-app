import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button, Card, CardContent, Collapse } from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { default as WeatherAPI, WeatherPeriod, Zone } from '..//api/WeatherAPI';
import '../css/WeatherDisplay.css';
import LocationPicker from './LocationPicker';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

function WeatherDisplay(): JSX.Element {
  const [zone, setZone] = useState({} as Zone);
  const [weather, setWeather] = useState([] as WeatherPeriod[]);
  const [expanded, setExpanded] = useState([] as boolean[]);
  const [screen, setScreen] = useState('location-picker');

  // Get the weather for the selected zone
  const getWeather = async (zone: Zone) => {
    const weather = await WeatherAPI.getWeather(zone.id);
    setWeather(weather);
    setExpanded(weather.map(() => false));
  };

  // When the user selects a location, get the weather for that location
  const onGetWeather = (zone: Zone) => {
    setZone(zone);
    setScreen('weather-display');
  };

  // update the weather every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (zone.id !== undefined) {
        getWeather(zone);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [zone]);

  // When the zone changes, get the weather for that zone
  useEffect(() => {
    if (zone.id !== undefined) {
      getWeather(zone);
    }
  }, [zone]);

  // When the user clicks the expand button, expand or collapse the details
  const handleExpandClick = (period: WeatherPeriod) => {
    setExpanded(
      expanded.map((value, index) => {
        if (index === weather.indexOf(period)) {
          return !value;
        }
        return value;
      })
    );
  };

  return (
    <div className="weather-display">
      <h1>Weather</h1>
      {screen === 'location-picker' && (
        <LocationPicker onGetWeather={onGetWeather} />
      )}
      {screen === 'weather-display' && (
        <div className="weather-display-content">
          <div className="zone">
            <h2>Location: {zone.name}</h2>
            <Button
              variant="contained"
              onClick={() => {
                setScreen('location-picker');
              }}
            >
              Change Location
            </Button>
          </div>

          <div className="weather">
            {weather.length === 0 && <h3>No weather data available</h3>}
            {weather.map((period) => (
              <Card
                className="weather-period"
                key={period.name}
                variant="outlined"
              >
                <CardContent className="weather-period-content">
                  <h3 style={{ textAlign: 'left' }}>{period.name}</h3>
                  <div className="temp-section">
                    {period.high !== '' && (
                      <div className="temperature">
                        <ArrowDropUpIcon
                          className="weather-icon"
                          style={{ color: 'red' }}
                        />
                        {period.high}
                      </div>
                    )}
                    {period.low !== '' && (
                      <div className="temperature">
                        {period.high !== period.low && period.low}
                        <ArrowDropDownIcon
                          className="weather-icon"
                          style={{ color: 'blue' }}
                        />
                      </div>
                    )}
                  </div>
                  <ExpandMore
                    expand={expanded[weather.indexOf(period)]}
                    onClick={() => handleExpandClick(period)}
                    aria-expanded={expanded[weather.indexOf(period)]}
                    aria-label="show more"
                    className="weather-period-expand"
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                </CardContent>
                <Collapse
                  in={expanded[weather.indexOf(period)]}
                  timeout="auto"
                  unmountOnExit
                >
                  <CardContent>
                    <div className="weather-period-details">
                      {period.detailedForecast}
                    </div>
                  </CardContent>
                </Collapse>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherDisplay;
