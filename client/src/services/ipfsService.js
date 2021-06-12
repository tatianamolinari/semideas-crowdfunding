
const uint8ArrayToString = require('uint8arrays/to-string')
const { create } = require('ipfs-http-client')



class IPFSService {
    
    constructor() {
      this.init()
    }

    init() {
        this.ipfs_client = create('https://ipfs.infura.io:5001');
    }


    async addJson(json_value){
        const res = await this.ipfs_client.add(JSON.stringify(json_value));
        return res;
    }

    getIPFSUrlFromPath(path){
        return `https://ipfs.infura.io/ipfs/${path}`;
    }

    getCIDv1FromCID(cid){
        const cidv1 = cid.toV1().toBaseEncodedString('base32');
        return cidv1;
    }

    getIPFSUrlFromCID(cidv1){
        return `https://${cidv1}.ipfs.dweb.link`;
    }


    async getFileFromIPFSHash(hash){
        const content = [];
        for await (const file of this.ipfs_client.get(`/ipfs/${hash}`)) {
            console.log(file.type, file.path)
            if (!file.content) continue;
            for await (const chunk of file.content) {
                content.push(chunk)
            }
        }
        return uint8ArrayToString(content[0]);
    }

    async getJsonFromIPFSHash(hash){
        return JSON.parse(await this.getFileFromIPFSHash(hash));
    }

}

export const ipfsService = new IPFSService();
