const User = require('../model/user')

exports.getLogin = (req,res,next) =>{
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0]
    }else{
        message = null;
    }
    res.render('auth/login',{
        path:'login',
        pageTitle: 'Login',
        errorMessage: message
    })
}

exports.postLogin = (req,res,next) =>{
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
      .then(user => {
        if(!user){
            req.flash('error','Invalid email or password !');
            return res.redirect('/login')
        } else if(user.password === password){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err=>{
                res.redirect('/');
            })
        } else if(user.password !== password){
            req.flash('error','Invalid email or password !');
            return res.redirect('/login') 
        }
      })
      .catch(err => console.log(err));
}

exports.postLogout = (req,res,next) =>{
    req.session.destroy((err)=>{
        console.log(err);
        res.redirect('/login')
    })
}