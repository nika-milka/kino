require('jest-fetch-mock').enableMocks();
global.$ = require('jquery');
global.alert = jest.fn(); 