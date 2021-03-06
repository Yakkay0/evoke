
const credentials = require('./credentials')
const balance = require ('./balance')
const tr = require('./sendEther')
const contract =require('./contract')
const Web3 = require('web3')
const web3 = new Web3(credentials.ropstenURL)
const Web3Contract = new web3.eth.Contract(contract.ABI,contract.address)
const axios = require('axios')
const bearer = credentials.bearer
const host= credentials.host
const section = credentials.section
const ownerAddress = credentials.owner
const ownerPk = credentials.ownerPk
const EVCredeemedAddres = credentials.redeemedAddress
const usersVaultHost = 'http://172.18.0.16:3000'
const options = {
    headers: {
        accept: "application/json",
        Authorization: bearer,
    }
}
const motrainUsersPage1 = `${host}/sections/${section}/users`
const motrainUsersPage2 = `http://api.motrain.com/v1/sections/cba4231a-b125-fb6c-051a-cb79d7733ca3/users?continuation=eyJ0b2tlbiI6IitSSUQ6flFiNTlBTkFuZVFBUkFnUUFBQUFBQUE9PSNSVDoxI1RSQzoxMDAjSVNWOjIjSUVPOjY1NTUxI1FDRjoxI0ZQQzpBZ0VRRVJDc0FCRUNFZ0lpQUFBWVFBQVpnQXVBR0lBcWdBQ0FBY0FFNGtGQS93ZGhpcm1BVVFDQUFUZUZOSUFKZ0FHQUNJQVBnQUNBOW9BUGdBSEFJQkRmZ091QVI0RWNnZEtBU29JWWdBTEFBQklBSUdTQUVRQUFJaTZBNFFDSUFIYUNyb0FpZ0x1QnlZSW9nQmVBS0lCVGdNaUNISUFnZ091QUw0UXVnQUxBQVVBQWdLeUFNUUFDQkJLQVRZQmZnQjJBQ1lER2drRUNJR0FaZ0JxQUVZRGhBQURnRVVBREFDSUF3UDhmQUdFRUFCNFJCQUNJbWppRSIsInJhbmdlIjp7Im1pbiI6IiIsIm1heCI6IkZGIn19`
const motrainUsersPage3 = `http://api.motrain.com/v1/sections/cba4231a-b125-fb6c-051a-cb79d7733ca3/users?continuation=eyJ0b2tlbiI6IitSSUQ6flFiNTlBTkFuZVFDZkZBUUFBQUFBQUE9PSNSVDoyI1RSQzoyMDAjSVNWOjIjSUVPOjY1NTUxI1FDRjoxI0ZQQzpBZ0VRRVJCK0FKK1VBSUQyZ0ErQUFjQWdFTitBNjRCSGdSeUIwb0JLZ2hpQUFzQUFFZ0FnWklBUkFBQWlMb0RoQUlnQWRvS3VnQ0tBdTRISmdpaUFGNEFvZ0ZPQXlJSWNnQ0NBNjRBdmhDNkFBc0FCUUFDQXJJQXhBQUlFRW9CTmdGK0FIWUFKZ01hQ1FRSWdZQm1BR29BUmdPRUFBT0FSUUFNQUlnREEveDhBWVFRQUhoRUVBSWlhT0lRPSIsInJhbmdlIjp7Im1pbiI6IiIsIm1heCI6IkZGIn19`
var currentPage = 1
var currentUser = 1 //must be different to cero
var agents = []

payToNextAgent()

async function getMotrainUsers(page) {
    currentUser = 0
    currentPage ++
    await axios.get(page,options)
    .then((motrainUsers) => {
        agents = motrainUsers.data
        setTimeout(payToNextAgent,2000)
    }).catch(error => {console.log(error);})
}

function payToNextAgent(){ 
    if(agents.length > currentUser && currentUser >= 0 ) {
        console.log('------------------------------------')
        console.log(`Page: ${currentPage-1}, User: ${currentUser} of: ${agents.length}`)
        const agent = agents[currentUser]
        console.log(agent)
         checkUser(agent.id).then(function(agentAccount) {
            console.log('Retrieved address: '+agentAccount.address)
            transfer(agentAccount)
            .then((result)=>console.log('Transfer done'))
            .catch((error) => console.log(error))
            currentUser++
        }).catch((error) => {
            console.log(error)
            setTimeout(payToNextAgent,2000)
        })
    }else{
        switch (currentPage) {
            case 1:
                getMotrainUsers(motrainUsersPage1)
                break
            case 2:
                getMotrainUsers(motrainUsersPage2)
                break
            case 3:
                getMotrainUsers(motrainUsersPage3)
                break
            default:
                console.log("Sending Ether completed")
                break  
        }
    }
}

function checkUser(motrainUserID){
        const account = web3.eth.accounts.create()
        return new Promise (function(resolve,reject){
            axios.post(usersVaultHost+'/create-mootivated-bc-users/',
            {
              "motrain": motrainUserID,
              "pv_key": account.privateKey,
              "address": account.address
            }
          ).then(function(userAccount) {
              console.log('Check User success')
              return resolve(userAccount.data)
          }).catch((error) => {
              console.log(error)
              setTimeout(payToNextAgent,2000)
            })
        })
}

async function transfer(agentAccount) {
    await tr.transaction(
        web3,
        agentAccount.address,
        ownerAddress,
        ownerPk,
        '0.005',
    ).then(result => {
        console.log ('Transfer status: '+result)
        setTimeout(payToNextAgent,2000)
        }
    ).catch(error => {
        console.log (error)
        setTimeout(payToNextAgent,2000)
    })
}