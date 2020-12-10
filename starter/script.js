/*eslint-disable*/
'use strict';


const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workout {

  constructor(coords, distance, duration) {
    this.date = new Date();
    this.id = (Date.now() + '').slice(-10);
    this.coords = coords;
    this.distance = distance; // km
    this.duration = duration; // mins
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([39, -12], 5.2, 24, 178);
const cycle1 = new Cycling([39, -12], 25.2, 95, 750);

console.log(run1, cycle1)


// APPLICATION Arc.

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
      alert('Could not get coordinates');
    });
  }

  _loadMap(position) {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}z`)

    const coords =[latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
  // Handles click on Map

  this.#map.on('click', this._showForm.bind(this));
  }


  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {

    e.preventDefault();
    const validInputs = (...inputs) => inputs.every(input => Number.isFinite(input));
    const allPositive = (...inputs) => inputs.every(input => input > 0);

    // get data from Form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng
    let workout;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (!validInputs(distance, duration, cadence) ||
          !allPositive(distance, duration, cadence))

        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);

    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

        if (!validInputs(distance, duration, elevation) ||
          !allPositive(distance, duration))

          return alert('Inputs have to be positive numbers');

        workout = new Cycling([lat, lng], distance, duration, elevation);

    }


    // add object to workout array
    this.#workouts.push(workout);
    console.log(workout);
    // render workout: as marker & on lits


  // Clear input fields
    inputDistance.value = inputDuration.value = inputElevation.value = inputCadence.value = '';

  // Display Marker
    L.marker([lat, lng]).addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup'
        })
      )
      .setPopupContent('Running Workout')
      .openPopup();
  }
}

const app = new App();
