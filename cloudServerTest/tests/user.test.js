const it = require("ava").default;
const chai = require("chai");
var expect = chai.expect;
const startDB = require('../helpers/DB');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { addUser,deleteUser,getAllUsers,getSingleUser} = require('../index');
const User = require('../models/user');
const sinon = require("sinon");
const utils = require('../helpers/utils')
it.before(async (t)=>{
    t.context.mongod = await MongoMemoryServer.create();
    process.env.MONGOURI = t.context.mongod.getUri('cloudUnitTesting');
    await startDB();
}

);

it.after(async (t)=>{
 await t.context.mongod.stop({doCleanUp: true});
})
it("create use succesfully", async (t) => {
  // setup
  const request = {
    body: {
      firstName: "Menna",
      lastName: "Hamdy",
      age: 11,
      job: "fs",
    },
  };
  const expectedResult = {
    fullName: "Menna Hamdy",
    age: 11,
    job: "fs",
  };
//   sinon.stub(utils, 'getFullName').returns('Menna Hamdy');
  sinon.stub(utils, 'getFullName').callsFake((fname, lname)=>{
    expect(fname).to.be.equal(request.body.firstName);
    expect(lname).to.be.equal(request.body.lastName);
    return 'Menna Hamdy'
  })
  const actualResult = await addUser(request);
  const result = {
    ...expectedResult,
    __v: actualResult.__v,
    _id: actualResult._id
  }
  expect(actualResult).to.be.a('object');
  expect(actualResult._doc).to.deep.equal(result);
  t.teardown(async ()=>{
    await User.deleteMany({
        fullName: request.body.fullName,
    })
  })
  t.pass();
});

it("gets all users successfully", async (t) => {
  const mockUsers = [
    { fullName: "Menna Hamdy", age: 11, job: "fs" },
    { fullName: "Hala Hamdy", age: 11, job: "fs" },
  ];
  await insertMockUsers(mockUsers);

  // Test execution
  const request = {}; 
  const users = await getAllUsers(request);

  // Assertions
  expect(users).to.be.an('array');
  expect(users).to.have.lengthOf(mockUsers.length); // Match exact number of users

  // Verify individual user properties (loop-based approach)
  for (const user of users) {
    expect(user).to.have.property('fullName');
    expect(user).to.have.property('age');
    expect(user).to.have.property('job');

    const foundUser = mockUsers.find(mockUser => mockUser.fullName === user.fullName);
    expect(foundUser).to.exist; // Ensure corresponding mock user exists

    expect(user.age).to.equal(foundUser.age);
    expect(user.job).to.equal(foundUser.job);
  }

  // Teardown: Clear test data
  await User.deleteMany({});

  t.pass();
});

// Separate function to insert mock users (reusable)
async function insertMockUsers(users) {
  await User.insertMany(users);
}


it.skip("get a single user successfully", async (t) => {

  const data = { fullName: "Menna Hamdy", age: 11, job: "fs" };
  const savedUser = await User.create(data); 

  const request = { params: { id: savedUser._id} }; 
  const user = await getSingleUser(request);

  expect(user).to.be.an('object');
  expect(user.fullName).to.equal(data.fullName);
  expect(user.age).to.equal(data.age);
  expect(user.job).to.equal(data.job);

  t.teardown(async ()=>{
    await User.deleteOne({ _id: savedUser._id });
  })

  t.pass();
});

it("deletes a user successfully", async (t) => {
  const data = { fullName: "Menna Hamdy", age: 11, job: "fs" };
  const savedUser = await User.create(data);

  const request = { params: { id: savedUser._id} }; // Convert ID to string
  const response = await deleteUser(request);

  // Assertions
  expect(response).to.be.an('object');
  expect(response.deleted).to.equal(1);

  expect(User.findByIdAndDelete(savedUser._id));

  await User.deleteMany({});

  t.pass();
});




                                                                   






// getUsers
// getSingleUser
// deleteUser

// bonus : validation, updateUser