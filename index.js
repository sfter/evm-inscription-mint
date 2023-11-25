const { ethers } = require("ethers");



// ================================ 以下参数配置，自行修改 ========================
// 配置你的私钥和目标地址
const privateKey = ""; 

// 接收地址（跟私钥绑定的钱包地址）
const toAddress = ""; 

// 铭文json数据（替换成你想打的铭文json格式数据）
const tokenJson = 'data:,{"p":"fair-20","op":"mint","tick":"fair","amt":"1000"}';

// 你想要打多少张，这里就设置多少，建议单次别超过50，不然容易不上链
const repeatCount = 1; 

// RPC结点（兼容 evm 链都行）打哪条链就用哪条链的节点地址
// eth =>  https://mainnet.infura.io/v3
// arb => https://arb1.arbitrum.io/rpc
// polygon => https://polygon-rpc.com
// op => https://mainnet.optimism.io
// linea => https://mainnet.infura.io/v3
// scroll => https://rpc.scroll.io
// zks => https://mainnet.era.zksync.io
const rpcUrl = "https://arb1.arbitrum.io/rpc"

// 限制gasLimit，根据当前网络转账的设置，不知道设置多少的去区块浏览器看别人转账成功的是多少	
const gasLimit = 1066989
// ================================ 以上是参数配置，自行修改 ========================





// 连接到结点
const provider = new ethers.providers.JsonRpcProvider(rpcUrl); 

// 创建钱包
const wallet = new ethers.Wallet(privateKey, provider);

// 转成16进制
const convertToHexa = (str = '') =>{
   const res = [];
   const { length: len } = str;
   for (let n = 0, l = len; n < l; n ++) {
      const hex = Number(str.charCodeAt(n)).toString(16);
      res.push(hex);
   };
   return `0x${res.join('')}`;
}

// 获取当前账户的 nonce
async function getCurrentNonce(wallet) {
  try {
    const nonce = await wallet.getTransactionCount("pending");
    console.log("Nonce:", nonce);
    return nonce;
  } catch (error) {
    console.error("Error fetching nonce:", error.message);
    throw error;
  }
}

// 获取当前主网 gas 价格
async function getGasPrice() {
  const gasPrice = await provider.getGasPrice();
  return gasPrice;
}

// 转账交易
async function sendTransaction(nonce, gasPrice) {
  const hexData	= convertToHexa(tokenJson);
  const transaction = {
    to: toAddress,
	// 替换为你要转账的金额
    value: ethers.utils.parseEther("0"),
    // 十六进制数据
    data: hexData,
    // 设置 nonce
    nonce: nonce,
    // 设置 gas 价格
    gasPrice: gasPrice,
	// 限制gasLimit，根据当前网络转账的设置，不知道设置多少的去区块浏览器看别人转账成功的是多少	
    gasLimit: gasLimit,
  };

  try {
    const tx = await wallet.sendTransaction(transaction);
    console.log(`Transaction with nonce ${nonce} hash:`, tx.hash);
  } catch (error) {
    console.error(`Error in transaction with nonce ${nonce}:`, error.message);
  }
}

// 发送多次交易
async function sendTransactions() {
  const currentNonce = await getCurrentNonce(wallet);
  const gasPrice = await getGasPrice();

  for (let i = 0; i < repeatCount; i++) {
    await sendTransaction(currentNonce + i, gasPrice);
  }
}

sendTransactions();
