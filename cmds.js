const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

exports.helpCmd = rl =>{
	 log("Commandos");
      log(" h|help - Muestra esta ayuda.");
      log("	list - Listar los quizzes existentes.");
      log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado.");
      log(" add - Añadir un nuevo quiz interactivamente.");
      log(" delete <id> - Borrar el quiz indicado.");
      log(" edit <id> - Editar el quiz indicado.");
      log(" test <id> - Probar el quiz indicado.");
      log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
      log(" credits - Créditos.");
      log(" q|quit - Salir del programa.");
      rl.prompt();
  };

exports.listCmd = rl =>{
	 
   model.getAll().forEach((quiz, id) => {

        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
	});

   rl.prompt();
      
  };

exports.showCmd =  (rl,id) =>{
	 
       	if (typeof id === "undefined"){
        	errorlog(`Falta el parámetro id`);
    	}else{
        	try{
            	const quiz = model.getByIndex(id);
            	log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        } catch(error){
            errorlog(error.message);
        }
    }


	rl.prompt();

  };
exports.addCmd = (rl) =>{


	rl.question(colorize(' Introduzca una pregunta: ', 'red'), question =>{

        rl.question(colorize(' Introduzca una respuesta ', 'red'), answer =>{

            model.add(question, answer);
            log(` [${colorize('Se ha añadido', 'magenta')}]: ${question} ${colorize('=>','magenta')} ${answer}`);
            
            rl.prompt();
        });
	});

  };

exports.deleteCmd = (rl,id) =>{
	 
      	if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id`);
    	}else{
        	try{
            	model.deleteByIndex(id);
        } catch(error){
            errorlog(error.message);
        }
    }
rl.prompt();

  };

exports.editCmd = (rl,id) =>{
	 
      if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    }else{
        try{
        const quiz = model.getByIndex(id);    

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

        rl.question(colorize(" Introduzca una pregunta: ", "red"), question =>{
            
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
    
                rl.question(colorize(" Introduzca una respuesta: ", "red"), answer =>{
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
}

  };

exports.testCmd = (rl,id) =>{
	 
      if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id`);
        rl.prompt();
    }else{
        try{

        const quiz = model.getByIndex(id);    

        rl.question(`${colorize(quiz.question, 'red')} `, question => {     
                if(question.toLowerCase() === quiz.answer.toLowerCase() ){
                    log("Respuesta correcta:");
                    biglog(' CORRECTA ','green');
                }else{
                    log("Respuesta incorrecta:");
                    biglog(' INCORRECTA ', 'magenta');
                }
                rl.prompt();
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
}

  };

exports.playCmd = (rl) =>{

    
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
playOne();

};