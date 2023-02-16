import { Autocomplete, Button, TextField } from '@mui/material';
import React, { SyntheticEvent } from 'react';
import { StateObject, useStates } from 'react-us-states';
import WeatherAPI, { Zone } from '../api/WeatherAPI';
import '../css/LocationPicker.css';

/**
 * LocationPicker
 * @param props
 * @description
 * This component is used to select a state and zone to get weather for.
 * It uses the onGetWeather callback to pass the selected zone to the parent component.
 * The parent component should then use the zone to get weather.
 * */
function LocationPicker(props: {
  onGetWeather: (zone: Zone) => void;
}): JSX.Element {
  const [state, setState] = React.useState({} as StateObject);
  const [zones, setZones] = React.useState([] as Zone[]);
  const [zone, setZone] = React.useState({} as Zone);
  const states = useStates();

  // When the state changes, get the zones for that state
  const handleStateChange = (event: SyntheticEvent, value: any) => {
    setZone({} as Zone);
    setState(value || '');
    getZones(value?.abbreviation);
  };

  // When the zone changes, set the zone
  const handleZoneChange = (event: SyntheticEvent, value: any) => {
    setZone(value || '');
  };

  // Get the zones for the selected state
  const getZones = async (state: string) => {
    if (state === undefined) {
      setZones([]);
      return;
    }
    const zones = await WeatherAPI.getZone(state);
    setZones(zones);
  };

  return (
    <div className="location-picker">
      <Autocomplete
        id="state-picker"
        options={states}
        getOptionLabel={(option) => option.name}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="State" variant="outlined" />
        )}
        onChange={handleStateChange}
      />
      <Autocomplete
        id="zone-picker"
        options={zones}
        getOptionLabel={(option) => option.name}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextField {...params} label="Zone" variant="outlined" />
        )}
        onChange={handleZoneChange}
        disabled={state === undefined || state.abbreviation === undefined}
        key={state.abbreviation}
      />
      <Button
        variant="contained"
        disabled={zone === undefined || zone.name === undefined}
        onClick={() => {
          props.onGetWeather(zone);
        }}
      >
        Get Weather
      </Button>
    </div>
  );
}

export default LocationPicker;
