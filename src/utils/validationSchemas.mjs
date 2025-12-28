


export const createUserValidationSchema={
    user_name:{
        notEmpty:{
            errorMessage:"user name must not be empty"
        },
        isLength:{
            options:{min:3,max:12},
            errorMessage:"user name length must be between 3 to 12 characters"
        },
        isString:{
            errorMessage:"user name must be a string"
        }
    },
    //     age:{
    //         notEmpty:{
    //         errorMessage:"age must not be empty"
    //     }
    // }
        password:{
            notEmpty:{
            errorMessage:"password must not be empty"
        }
    }
}