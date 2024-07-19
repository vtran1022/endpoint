import { folderDirectory } from './model/data';

const rootFolder = folderDirectory('/');

const createRoute = (folderPath) => {
    const folders = folderPath.split('/');

    let currentFolder = rootFolder;
    for (const folder of folders) {
        if (!currentFolder.subFolders[folder]) {
            currentFolder.subFolders[folder] = folderDirectory(folder);
        }

        currentFolder = currentFolder.subFolders;
    }
};

const _validateFolderPath = (folders) => {
    let currentFolder = rootFolder;
    for (const folder of folders) {
        currentFolder = currentFolder.subFolders[folder]
        if (!currentFolder) {
            return {
                exist: false,
                folderHash: { name: folder },
            };
        }
    }

    return {
        exist: true,
        folderHash: currentFolder,
    };
};

const moveRoute = (sourceFolderPath, destinationFolderPath) => {
    const sourceParts = sourceFolderPath.split('/');
    const destinationParts = destinationFolderPath.split('/');

    const folderMoving = _validateFolderPath(sourceParts);
    if (!folderMoving.exist) {
        throw `Cannot move folder - ${folderMoving.folderHash.name} does not exist`;
    }

    const destinationFolder = _validateFolderPath(destinationParts);
    if (!destinationFolder.exist) {
        throw `Cannot move folder - ${destinationFolder.folderHash.name} does not exist`;
    }

    destinationFolder.folderHash.subFolders[folderMoving.folderHash.name] = folderMoving.folderHash;

    const movedFolderParent = _validateFolderPath(sourceParts.slice(0, -1))
    delete movedFolderParent.folderHash.subFolders[folderMoving.folderHash.name];
};

const listDirectory = () => {
    const result = [];
    const stack = [{
        folder: rootFolder,
        indent: 0,
    }];

    while (stack.length > 0) {
        const { folder, indent } = stack.pop();
        result.push('\n' + '   '.repeat(indent) + folder.name);

        const subfolders = Object.keys(folder.subFolders);
        subfolders.forEach((name) => {
            stack.push({
                folder: folder.subFolders[name],
                indent: indent + 1,
            });
        });
    }

    return result.toString();
};

const deleteRoute = (folderPath) => {
    const folderParts = folderPath.split('/');
    const checkFolder = _validateFolderPath(folderParts);
    if (!checkFolder.exist) {
        throw `Cannot delete ${folderPath} - ${checkFolder.folderHash.name} does not exist`;
    };
    
    const folderName = folderParts[folderParts.length - 1];
    const parentFolder = _validateFolderPath(folderParts.slice(0, -1));
    delete parentFolder.folderHash.subFolders[folderName];
};

const processCommand = (command) => {
    const commandParts = command.split(' ');
    const commandType = commandParts[0];
    const folderPath = commandParts[1];

    switch (commandType) {
        case 'CREATE': 
            return createRoute(folderPath);
        case 'MOVE':
            const destFolder = commandParts[2];
            if (!folderPath && !destFolder) {
                throw `InvalidInput: expecting source path and destination path`;
            } else {
                return moveRoute(folderPath, destFolder);
            }
        case 'LIST':
            return listDirectory();
        case 'DELETE':
            return deleteRoute(folderPath);
    }
};

export { processCommand };
