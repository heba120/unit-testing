// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const startDB = require('./helpers/DB');
const utils = require('./helpers/utils')
const User = require('./models/user');
fastify.register(startDB);
// Declare a route
fastify.get('/', function handler (request, reply) {
  reply.send({ hello: 'world' })
});
const addUser = async function (request, reply) {
    try {
        const userBody = request.body;
        console.log(userBody);
        userBody.fullName = utils.getFullName(userBody.firstName, userBody.lastName);
        delete userBody.firstName;
        delete userBody.lastName;
        const user = new User(userBody);
        const addedUser = await user.save();
        return addedUser;
            
    } catch (error) {
        throw new Error(error.message);        
    }
  }

const getAllUsers = async (request, reply)=>{
    try {
        const users = User.find({});
        return users;        
    } catch (error) {
        throw new Error(error.message);        

    }

}
const getSingleUser = async (request, reply)=>{
    try {
        const { id } = request.params;
        const user = User.findById(id);
        return user;        
    } catch (error) {
        throw new Error(error.message);        

    }

}

const deleteUser = async (request, reply) =>{
    try {
        const { id } = request.params;
        const deletedUser = User.findByIdAndDelete(id);
        console.log("🚀 ~ deleteUser ~ deletedUser:", deletedUser);
        return {deleted: 1};
    } catch (error) {
        throw new Error(error.message);
    }
}

fastify.post('/users', addUser);
fastify.get('/users', getAllUsers);
fastify.get('/users/:id', getSingleUser);
fastify.delete('/users/:id', deleteUser);

// Run the server!
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
module.exports = { getSingleUser , addUser , getAllUsers ,deleteUser};