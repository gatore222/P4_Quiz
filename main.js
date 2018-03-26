
const readline = require('readline');

const model = require('./model');
const cmds = require('./cmds'); 
const {log, biglog, errorlog, colorize} = require("./out");


biglog('CORE Quiz','green');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: colorize("quiz > ",'blue'),
  completer: (line) => {
  const completions = 'h help add delete show edit list test play p credits q quit'.split(' ');
  const hits = completions.filter((c) => c.startsWith(line));
  // show all completions if none found
  return [hits.length ? hits : completions, line];
}

});

rl.prompt();

rl.on('line', (line) => {
	let args = line.split(" ");
	let cmd = args[0].toLowerCase().trim();


  switch (cmd) {
  	case '': 
  		rl.prompt();
  		break;
    case 'h':
    case 'help':
    	cmds.helpCmd(rl);
      
    break;

    case 'q':
    case 'quit':
    	rl.close();
    	break;

    case 'add':
    	cmds.addCmd(rl);
    break;

    case 'list':
    	cmds.listCmd(rl);
    break;

    case 'show':
    	cmds.showCmd(rl, args[1]);
    break;

    case 'test':
    	cmds.testCmd(rl, args[1]);
    break;

    case 'delete':
    	cmds.deleteCmd(rl, args[1]);
    break;

    case 'edit':
    	cmds.editCmd(rl, args[1]);
    break;

    case 'play':
    case 'p':
    	cmds.playCmd(rl);
    break;

    case 'credits':
    console.log('Autor de la practica.');
    console.log('Gabriel Toro Retivoff');
    rl.prompt();
    break;

    default:
      console.log(`Comando desconocido: '${colorize(cmd, 'red')}'`);
      console.log(`Use ${colorize('help', 'green')} para ver todos los comandos disponibles.`);
      rl.prompt();
      break;      
  }
   
}).on('close', () => {
  console.log('Finito! Adios!');
  process.exit(0);
});



