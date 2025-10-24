process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const chai = require('chai');

global.expect = chai.expect;
global.should = chai.should();
