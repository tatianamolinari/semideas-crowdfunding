const uint8ArrayToString = require('uint8arrays/to-string');
const { create } = require('ipfs-http-client');
const bs58 = require('bs58');

class IPFSService {
    
    constructor() {
      this.init()
    }

    /**
     * Creates a new connection to an Infura IPFS node.
     */
    init() {
        this.ipfs_client = create('https://ipfs.infura.io:5001');
    }

    /**
     * Saves a json in IPFS. 
     * @param {JSON} json_value json to save.
     * @returns {String} IPFS hash to access the saved json. 
     */
    async addJson(json_value){
        const res = await this.ipfs_client.add(JSON.stringify(json_value));
        return res.path;
    }

    /**
     * Returns and IPFS url to access the data by the path provided.
     * @param {String} path
     * @returns {String} ipfs url to access the data. 
     */
    getIPFSUrlFromPath(path){
        return `https://ipfs.infura.io/ipfs/${path}`;
    }

    /**
     * Get a file previously saved in IPFS by its hash (path).
     * @param {String} hash
     * @returns {String} file saved. 
     */
    async getFileFromIPFSHash(hash){
        const content = [];
        for await (const file of this.ipfs_client.get(`/ipfs/${hash}`)) {
            if (!file.content) continue;
            for await (const chunk of file.content) {
                content.push(chunk)
            }
        }
        return uint8ArrayToString(content[0]);
    }

    /**
     * Get a json previously saved in IPFS by its hash (path).
     * @param {String} hash 
     * @returns {JSON} Json file saved. 
     */
    async getJsonFromIPFSHash(hash){
        return JSON.parse(await this.getFileFromIPFSHash(hash));
    }


    addressToHexBytes(address){
        const out = bs58.decode(address);
        const hexBytes = new Buffer(out).toString('hex');
        return hexBytes.substring(4);
    }
    
    hexBytesToAddress(bytes){
        const out = bs58.encode(new Buffer("1220" + bytes, 'hex'));
        return out;
    }

    /**
     * Get an IPFS hash (path) from a bytes32 saved in the blockchain.
     * @param {String} bytes32 
     * @returns {String} original IPFS hash (path). 
     */
    getIPFSHash(bytes32){
        return this.hexBytesToAddress(bytes32.substring(2));
    }

     /**
     * Get an bytes32 to save in the blockchain from IPFS hash.
     * @param {String} original IPFS hash (path).  
     * @returns {String} bytes32 
     */
    getBytes32Hash(ipfsHash){
        const bytes32Hash = "0x" + this.addressToHexBytes(ipfsHash);
        return bytes32Hash;
    }

}

export const ipfsService = new IPFSService();
