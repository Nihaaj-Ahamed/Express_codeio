import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashPassword = (password)=>{
    const salt= bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    const hash= bcrypt.hashSync(password,salt);
    return hash;
}

export const comparePassword = (plain,hashed)=>{
     bcrypt.compareSync(plain,hashed);
}