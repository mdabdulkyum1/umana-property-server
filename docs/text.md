### umana property

## auth

```
 [done]: register user 
    |-- /auth/create-account
    body:
    {
       "name": "Md Abdul Kyum",
       "email": "kyummdabdul@gmail.com",
       "phone": "01754462008",
       "password": "123456As",
       "fatherName": "Shah Alom"
    }

[done]: login user 
    |-- /auth/login
    body: 
    {
        "phone":"01754462008",
        "password":"123456As"
    }

```