<h1>WELCOME TO COMMUNITY DISCUSSION PLATFORM </h1>

<h2> Tech Stack</h2>
<ul>
<li> Frontend: React + Vite + Tailwind CSS
<li> Backend: Node.js + Express
<li> Database: MySQL
</ul>

<h2> Project Architecture</h2>

```
community-platform/
│
├── client/         # React frontend
├── server/         # Express backend
├── database/       # SQL schema
└── README.md

```

<h2>Prerequisites </h2>
Make sure you have installed:
<ul>
<li>Node.js (v18+ recommended)
<li>npm
<li>MySQL Server
</ul>

<h2>Setup Instructions </h2>
<h3> Clone the Repository</h3>

```
git clone <repo-url>
cd cdp
```

<h3>Frontend Setup</h3>

```
cd client
npm install
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

<h3>Backend Setup</h3>

```
cd server
npm install
npx nodemon index.js
```

Backend will run at:

```
http://localhost:5000
```

<h3> Database Setup (MySQL)</h3>

<h4> Step 1: Setup .env file </h4>

Create a `.env` file according to `example.env` and change the DB_PASSWORD to your mysql password

<h4> Step 2: Login to MySQL </h4>

```
mysql -u root -p
```

<h4>Step 3: Create Database </h4>

```
SOURCE {copy past file PATH of complete_schema.sql};
```

At `http://localhost:5000` you should see "API Running"
<br>
At `http://localhost:5000/users` you should see the data <br>
<strong>-> setup working!</strong>

<h2>Policy for making changes </h2>
Always create your own branch and commit changes in it before merging it into the main branch