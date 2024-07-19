import { processCommand } from './directoryRoutes';

const handler = async (commandStringLine) => {
    const commands = commandStringLine.split(',');
    try {
        for (const command of commands) {
            console.log(processCommand(command));
        }
    } catch (error) {
        throw error;
    }
};

handler(process.argv.slice(2)[0])
.catch((error) => {
    console.error(error);
    process.exit(1);
});
