// WhereAmI
import React, { useState, useEffect } from 'react';
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

// [Violation] Only request geolocation information in response to a user gesture.
// Avoids Requesting The Geolocation Permission On Page Load:
// https://developers.google.com/web/tools/lighthouse/audits/geolocation-on-load

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

// https://www.robinwieruch.de/react-hooks-fetch-data/
const App = () => {
  console.log(navigator.userAgent, navigator.vendor);

  const [isLoading, setLoading] = useState(true);
  const [data,      setData]    = useState(null);
  const [error,     setError]   = useState(null);
  useEffect(() => {
    const promiseIp  = requestUrlJson(urlIpLookUp);
    promiseIp.then(
      data => {
        setData(data);
        setLoading(false);
        console.log(JSON.stringify(data));
      },
      error => {
        setError(error);
        setLoading(false);
      }
    );
  }, []); // []: only after the initial render

  const [pos,       setPos]     = useState(null);
  const requestGeo = () => {
    const promisePos = requestCurrentUserPosition();
    promisePos.then(
      pos => {
        setPos(pos);
        console.log(pos.coords.latitude, pos.coords.longitude);
      },
      err => console.error('An error has occurred while retrieving location', err)
    );
  }
  
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
          `${pos.coords.latitude},${pos.coords.longitude},${pos.coords.accuracy}` :
          <button onClick={() => requestGeo()}>Request Geolocation</button>}</li>
    </div>
  );
}

export default App;
