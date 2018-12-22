// WhereAmI
import React from 'react';
import './App.css';

// console.log = function(){}  // on production, disable console.log

const urlIpLookUp = 'http://ip-api.com/json?lang=ja';

const requestUrlJson = (url) =>
  new Promise((resolve, reject) => {  // wrapper (using Promise instead of a callback function)
    fetch(url)
      .then(res => {
        let ct = res.headers.get("content-type");
        if (ct && ct.includes("application/json"))
          return res.json();
        throw new TypeError("Oops, no JSON data!");
      })
      .then(resolve)
      .catch(reject);
  });

const requestCurrentUserPosition = () => 
  new Promise((resolve, reject) => {  // wrapper
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition( // async
        // 1. success: a callback function that takes a Position object
        // 2. error  : an optional callback function that takes a PositionError object
        // 3. option : an optional PositionOptions object
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeOut: 5000,  // amount of time before the error callback is invoke
          maximumAge: 0   // maximum cached position age
        }
      );
    } else {
      const errMsg = 'geolocation is not enabled on this browser';
      reject(errMsg);
      console.log(errMsg);
    }
  });

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pos:  null,
      data: null,
      isLoading: true
    };
  }

  componentDidMount() {
    console.log(navigator.userAgent, navigator.vendor);
    this.setState({ isLoading: true });
    
    const promiseIp  = requestUrlJson(urlIpLookUp);
    const promisePos = requestCurrentUserPosition();

    promiseIp.then(
      data => {
        this.setState({ data, isLoading: false });
        console.log(JSON.stringify(data));
      },
      error => this.setState({ error, isLoading: false })
    );

    promisePos.then(
      pos => {
        this.setState({ pos })
        console.log(pos.coords.latitude, pos.coords.longitude);
      },
      err => console.error('An error has occurred while retrieving location', err)
    );
  }

  render() {
    const { pos, data, isLoading, error } = this.state;

    if (!data)     return <p>Please wait ...</p>;
    if (error)     return <p>{error.message}</p>;
    if (isLoading) return <p>Loading ...</p>;

    return (
      <div className="App">
        <li>Location:{data.regionName}</li>
        <li>Country:{data.country}</li>
        <li>Latitude, Longitude:{data.lat},{data.lon}</li>
        <li>IP:{data.query}</li>
        <li>Geolocation Position: {pos ?
            `${pos.coords.latitude},${pos.coords.longitude},${pos.coords.accuracy}` : '🕛'}</li>
      </div>
    );
  }
}

export default App;
