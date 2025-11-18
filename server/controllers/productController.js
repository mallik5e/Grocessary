import {v2 as cloudinary} from 'cloudinary'
import Product from '../models/Product.js'

const uploadToCloudinary = async (filePath, retries = 3) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      timeout: 90000, // ⏱️ 90 seconds Cloudinary-side timeout
    });

    return result;
  } catch (error) {
    console.error("Upload attempt failed:", error);

    if (retries > 0) {
      console.warn(`Retrying upload... attempts left: ${retries - 1}`);
      await new Promise((res) => setTimeout(res, 1000)); // Wait 1s
      return uploadToCloudinary(filePath, retries - 1);
    }

    throw new Error(error.message || "Cloudinary upload failed");
  }
};




export const addProduct = async (req,res) => {
   try{
     if (!req.body.productData) {
      return res.status(400).json({ success: false, message: "Missing productData" });
    }
     let productData = JSON.parse(req.body.productData)
     
     const images = req.files

     {/*let imagesUrl = await Promise.all(
        images.map(async(item)=>{
            let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
            return result.secure_url
        })
     )*/}
     const imagesUrl = await Promise.all(
  images.map(async (item) => {
    const result = await uploadToCloudinary(item.path);
    return result.secure_url;
  })
);

     console.log(imagesUrl) 
     console.log("Entering 3")
     await Product.create({...productData, image: imagesUrl})

     res.json({success:true, message: "Product Added"})
   }catch(error){
     console.log("error: ",error.message);
     res.json({success:false, message:error.message})
   }
}

export const ProductList = async (req,res) => {
   try{
      const products = await Product.find({})
      res.json({success:true, products})
   }catch(error){
     console.log(error.message);
     res.json({success:false, message:error.message})
   }
}

export const productById = async (req,res) => {
    try{
      const {id} = req.body;
      const product = await Product.findById(id);
      res.json({success:true, product})
   }catch(error){
     console.log(error.message);
     res.json({success:false, message:error.message})
   }
}

export const changeStock = async (req,res) => {
    try{
     const {id, inStock} = req.body;
     await Product.findByIdAndUpdate(id, {inStock})
     res.json({success:true, message: "Stock Updated"})
   }catch(error){
     console.log(error.message);
     res.json({success:false, message:error.message})
   }
}
