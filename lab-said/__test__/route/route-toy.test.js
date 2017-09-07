'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});
require('../../lib/server').listen(3000);
require('jest');

describe('Testing toy routes', function() {
  describe('all requests to /api/toy', () => {
    describe('POST requests', () => {
      describe('Valid Requests', ()  => {
        beforeAll(done => {
          superagent.post(':3000/api/toy')
            .type('application/json')
            .send({
              name: 'barney',
              desc: 'purple dino',
            })
            .then(res => {
              this.mockToy = res.body;
              this.resPost = res;
              done();
            });
        });
        test('should create and return a new toy, given a valid request', () => {
          expect(this.mockToy).toBeInstanceOf(Object);
          expect(this.mockToy).toHaveProperty('name');
          expect(this.mockToy).toHaveProperty('desc');
          expect(this.mockToy).toHaveProperty('_id');
        });
        test('should have a name, given a valid request', () => {
          expect(this.mockToy.name).toBe('barney');
        });
        test('should have a desc, given a valid request', () => {
          expect(this.mockToy.desc).toBe('purple dino');
        });
        test('should have an _id, given a valid request', () => {
          expect(this.mockToy).toHaveProperty('_id');
          expect(this.mockToy._id).toMatch(/([a-f0-9]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/i);
        });
        test('should return a 201 CREATED, given a valid request', () => {
          expect(this.resPost.status).toBe(201);
        });
      });
      describe('Invalid Requests', () => {
        // TODO: error status, message, name, bad endpoint
        beforeAll(done => {
          superagent.post(':3000/api/toy')
            .type('application/json')
            .send({})
            .catch(err => {
              this.errPost = err;
              done();
            });
        });
        test('should return a status of 400 Bad Request', () => {
          expect(this.errPost.status).toBe(400);
          expect(this.errPost.message).toBe('Bad Request');
        });
        test('should return 404 on invalid endpoint', done => {
          superagent.post(':3000/bad/endpoint')
            .type('application/json')
            .send({})
            .catch(err => {
              expect(err.status).toBe(404);
              done();
            });
        });
      });
    });

    describe('GET requests', () => {
      test('should get the record from the toy dir', done => {

        superagent.get(':3000/api/toy')
          .query({_id: this.mockToy._id})
          .then(res => {
            this.resGet = res.body;
            this.resGet.status = res.status;
            expect(this.resGet).toBeInstanceOf(Object);
            expect(this.resGet).toHaveProperty('name');
            expect(this.resGet).toHaveProperty('desc');
            expect(this.resGet).toHaveProperty('_id');
            done();
          });
      });

      test('should have a name, given a valid request', (done) => {
        expect(this.resGet.name).toBe('barney');
        done();
      });
      test('should have a desc, given a valid request', (done) => {
        expect(this.resGet.desc).toBe('purple dino');
        done();
      });
      test('should have an _id, given a valid request', (done) => {
        expect(this.resGet).toHaveProperty('_id');
        expect(this.resGet._id).toMatch(/([a-f0-9]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/i);
        done();
      });
      test('should return a 200 CREATED, given a valid request', (done) => {
        expect(this.resGet.status).toBe(200);

        done();
      });
    });



    describe('PUT requests', () => {
      test('should have ...', done => {
        done();
      });
    });
    describe('DELETE requests', () => {
      describe('Valid Requests', () => {
        beforeAll(done => {
          superagent.delete(`:3000/api/toy/${this.mockToy._id}`)
            .then(res => {
              this.resDelete = res;
              done();
            });
        });
        test('should remove the record from the toy dir', done => {
          fs.readdirProm(`${__dirname}/../../data/toy`)
            .then(files => {
              console.log(files);
              let expectedFalse = files.includes(`${this.mockToy._id}.json`);
              expect(expectedFalse).toBeFalsy();
              console.log(expectedFalse);
              done();
            });
        });
      });
    });
  });
});
