import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as bodyParser from 'body-parser';
const multer = require('multer')
import mongoose from "mongoose";
import UserCollection, {User} from './models';
const cors = require('cors')

const jwt = require('jsonwebtoken');

const TOKEN_SECRET = '111111111111111';
const port = 3000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoUrl = 'mongodb://127.0.0.1:27017/omnios';
mongoose.connect(mongoUrl)
    .then(() => console.log('Connected to MongoDB'))


const upload = multer({ dest: __dirname+ 'pdf/' })


app.use(express.static(path.join(__dirname, 'public')));

const authenticateToken = (req: any, res: any, next:any) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, TOKEN_SECRET as string, (err: any, user: any) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      req.user = user
  
      next()
    })
  }

const  generateAccessToken =  (username: string) => {
    return jwt.sign(username, TOKEN_SECRET, { });
}

app.post('/login', (req, res) => {
    // Insert Login Code Here
    try {
        UserCollection.findOne({username: req.body.username, password: req.body.password}, (err: string, user: User) => {
            if (err) {
                res.status(500).send(err);
            } else if (user) {
                res.status(200).send({token: generateAccessToken(user.username)});
            } else {
                res.status(404).send('User not found');
            }
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500).send('Internal Server Error');;
    }
  });

  app.post('/register', (req, res) => {
    // Insert Login Code Here
    console.log(req.body)
    try {
        UserCollection.findOne({username: req.body.username}, (err: string, user: User) => {
            if (err) {
                res.status(500).send(err);
            } else if (user) {
                res.status(400).send('User already exists');
            } else {
                const newUser = new UserCollection({username: req.body.username, password: req.body.password});
                newUser.save((err: any) => {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.status(200).send({token: generateAccessToken(newUser.username)});
                    }
                });
            }
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500).send('Internal Server Error');;
    }
  });

app.get('/list',authenticateToken, (req, res) => {
    //to-do bad request
    try {
        fs.readdir(__dirname +'/pdf/',{ withFileTypes: true }, (err, files) => {
            if (err) {
                console.log(err)
                res.status(500).send('Internal Server Error');
                return;
            }
            console.log(files.map(file => file.name))
            res.send(files.map(file => file.name));
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500).send('Internal Server Error');;
    }
});

app.post('/upload', authenticateToken, upload.single('file'), async (req:any, res) => {
   
    try {
        
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500).send('Internal Server Error');
    }

});

app.listen(port, () => {
    console.log(`Running on port ${port}.`);
})