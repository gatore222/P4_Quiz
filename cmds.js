const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out");

const {models} = require('./model');

exports.helpCmd = (socket, rl) =>{
      log(socket, "Commandos");
      log(socket, " h|help - Muestra esta ayuda.");
      log(socket, " list - Listar los quizzes existentes.");
      log(socket, " show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
      log(socket, " add - Añadir un nuevo quiz interactivamente.");
      log(socket, " delete <id> - Borrar el quiz indicado.");
      log(socket, " edit <id> - Editar el quiz indicado.");
      log(socket, " test <id> - Probar el quiz indicado.");
      log(socket, " p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
      log(socket, " credits - Créditos.");
      log(socket, " q|quit - Salir del programa.");
      rl.prompt();
  };

/////////AUXILIARES/////////

const makeQuestion = (rl, text) => {

  return new Sequelize.Promise((resolve, reject) => {
    rl.question(colorize(text, 'red'), answer => {
      resolve(answer.trim());
    });
  });
};

const validateId = id => {

   return new Sequelize.Promise((resolve,reject) => {
     if (typeof id === "undefined"){
       reject(new Error(`Falta el parámetro <id>.`));
     } else {
       id = parseInt(id);
       if (Number.isNaN(id)){
         reject(new Error(`El valor del parámetro <id> no es un número.`));

       } else {
         resolve(id);
       }
     }
   });
};
/////////////////////////////


exports.listCmd = (socket, rl) =>{
	 
    models.quiz.findAll()
    .each(quiz => {
            log(socket, ` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
    })
    .catch(error => {
        errorlog(socket, error.message);
    })
    .then(() => {
        rl.prompt();
  });
      
};



exports.showCmd =  (socket, rl,id) =>{       
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz =>{
      if (!quiz){
        throw new Error(`No existe un quiz asociado al id=${id}.`);
      }
      log(socket, `[${colorize(quiz.id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
    })
    .catch(error => {
      errorlog(socket, error.message);
    })
    .then(() => {
      rl.prompt();
    });
  };



exports.addCmd = (socket, rl) =>{


    makeQuestion(rl, ' Introduzca una pregunta: ')
    .then(q => {
      return makeQuestion(rl, ' Introduzca la respuesta: ')
      .then(a => {
        return {question: q, answer: a};
      });
    })
    .then(quiz => {
      return models.quiz.create(quiz);
    })
    .then((quiz) => {
      log(socket, ` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
    })
    .catch(Sequelize.ValidationError, error => {
      errorlog(socket, 'El quiz es erróneo:');
      error.errors.forEach(({message}) => errorlog(socket, message));
    })
    .catch(error => {
      errorlog(socket, error.message);
    })
    .then(() => {
      rl.prompt();
  });
  };



exports.deleteCmd = (socket, rl,id) =>{
	 
   validateId(id)
   .then(id => models.quiz.destroy({where: {id}}))
   .catch(error =>{
      errorlog(socket, error.message);
   })

   .then(()=>{
    rl.prompt();
   })
  };


exports.editCmd = (socket, rl,id) =>{
	 
    validateId(id)
   .then(id => models.quiz.findById(id))
   .then(quiz =>{
    if (!quiz){
       throw new Error(`No existe un quiz asociado al id=${id}.`);
     }
      process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
      return makeQuestion(rl, ' Introduzca la pregunta: ')
      .then(q => {
          process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
          return makeQuestion(rl, 'Introduzca la respuesta: ')
          .then(a => {
              quiz.question = q;
              quiz.answer = a;
              return quiz;
       });
     });
   })
   .then(quiz => {
     return quiz.save();
   })
   .then(quiz => {
     log(socket, `Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`)
   })
    .catch(Sequelize.ValidationError, error => {
      errorlog(socket, 'El quiz es erroneo:');
      error.errors.forEach(({message}) => errorlog(socket, message));
    })
    .catch(error => {
      errorlog(socket, error.message);
    })
    .then(() => {
      rl.prompt();
  });

};

exports.testCmd = (socket, rl,id) =>{
	 
    validateId(id)
   .then(id => models.quiz.findById(id))
   .then(quiz =>{
    if (!quiz){
       throw new Error(`No existe un quiz asociado al id=${id}.`);
     }
    
    log(socket, `[${colorize(quiz.id,'magenta')}]: ${quiz.question}: `);
    return makeQuestion(rl, ' Introduzca la respuesta: ')
    .then(a => {

            if(quiz.answer.toLowerCase().trim() === a.toLowerCase().trim()){

                log(socket, "Respuesta correcta");

                biglog(socket, 'Correcta', 'green');

            } else{

                log(socket, "Respuesta incorrecta");

                biglog(socket, 'Incorrecta', 'red');

            }

        });
       }) 
     .catch(Sequelize.ValidationError, error => {
      errorlog(socket, 'El quiz es erroneo:');
      error.errors.forEach(({message}) => errorlog(socket, message));
    })
    .catch(error => {
      errorlog(socket, error.message);
    })
    .then(() => {
      rl.prompt();
  });
}; 


exports.playCmd = (socket, rl) =>{
/*
    
    let puntuacion = 0;
    let porResolver = [];
      
    for (var i = 0; i < model.count(); i++) {
            porResolver.push(model.getByIndex(i));
        
    };
const azar = () => {
    let id = Math.floor(Math.random()*porResolver.length);
}

const playOne = () => {

    if (porResolver.length === 0){
        log("No hay mas preguntas", "magenta");
        biglog(`${puntuacion}`, 'magenta');
        rl.prompt();
    
    }else{

        let id = Math.floor(Math.random()*porResolver.length);
        let quiz = porResolver[id];
        porResolver.splice(id,1)

                
       

        
            rl.question(`${colorize(quiz.question, 'red')} `, question => {
                
                if(question.toLowerCase() === quiz.answer.toLowerCase()){
                     puntuacion+=1;     
                                  

                if(porResolver.length === 0){
                        log(`No hay nada más que preguntar\nFin del juego. Aciertos: ${puntuacion}`);
                        biglog(`${puntuacion}`, "magenta");
                    }else{
                            log(`CORRECTO - Llevas ${puntuacion} aciertos`);
                            playOne();
                        };
                }else{
                    log(`INCORRECTO\nFin del juego. Total aciertos: ${puntuacion}`);
                    biglog(`${puntuacion}`, 'magenta');
                }
                rl.prompt();
            });
        };

}
playOne();*/

    let puntuacion = 0;
    let porResolver = [];
    const azar = () => {
    Math.floor(Math.random()*porResolver.length);
    }
let score = 0; 
    
    const playOne = () => {
        return new Sequelize.Promise((resolve,reject) => { 
            if(porResolver.length <=0){ 
                socket.write("\nNo hay más preguntas!"); 
                socket.write("\nFin del juego.Aciertos: \n"); 
                resolve(); 
                biglog(socket, score, 'magenta'); 
               return; 
            } 

            let id =  Math.floor(Math.random()*porResolver.length); 
            let quiz = porResolver[id];
            porResolver.splice(id,1); 
            makeQuestion(rl, colorize(quiz.question + '? ', 'red')) 
            .then(answer => { 
                if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){ 
                    score++; 
                    socket.write("CORRECTO - Lleva " + score + " aciertos \n"); 
                    resolve(playOne()); 
                } else {
                    socket.write("INCORRECTO.\n"); 
                    socket.write("\nFin del examen. Aciertos:"); 
                    resolve(); 
                    biglog(socket, score, 'magenta'); 
                }    
            }) 
}) 
    } 
    models.quiz.findAll({raw: true}) 
    .then(quizzes => { 
        porResolver = quizzes; 
      }) 
    .then(() => { 
       return playOne(); 
    }) 
    .catch(error => { 
        console.log(socket, error); 
    }) 
    .then(() => { 
        rl.prompt(); 
}) 

};
