const users = [];


// addUser

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if(!username || !room){
      return {
          error: 'Username and room are querired!'
      }
  }
 
  // Check for existing user
  const existingUser = users.find( (user) => {
     return user.room === room && user.username === username
  });
  
  // Validate username
  if(existingUser){
      return {
          error: 'Username is in use!'
      }
  }

  // Store user
  const user = { id, username, room };

  users.push(user);

  return { user }

}


// removeUser

const removeUser = (id) => {
  const index = users.findIndex( (user) => {
     return user.id === id;
  });

  if(index !== -1){
      // Splice remove items starting from the index provided and the amount of them provided too. 
      return users.splice(index, 1)[0];
  }
}

//getUser

const getUser = (id) => {

    return  users.find( user => user.id === id);
    
}


//getUsersInRoom

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();

    return users.filter( (user) => user.room === room)
   
   
    }

    

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
