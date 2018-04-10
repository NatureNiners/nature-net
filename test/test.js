var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../app');
var should = chai.should();

chai.use(chaiHttp);

describe('actions', function() {
  it('should list all actions on /actions GET', function(done) {
  chai.request(server)
    .get('/actions')
    .end(function(err, res){
      res.should.have.status(200);
      res.should.be.html;
      done();
    });
});
  it('should add a single user /user POST', function(done) {
  chai.request(server)
    .post('/users')
    .send({'firstName': 'Michael','lastName': 'Jordan','email': 'michael@gmail.com','password': '12345', 'subscription': 'Weekly'})
    .end(function(err, res){
      res.should.have.status(200);
      done();
    });
});
});