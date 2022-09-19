

export default async function getRcBalance1(req, res){
    await new Promise(resolve => setTimeout(resolve, 2000))
    res.status(200).json({balance : 100})
} 