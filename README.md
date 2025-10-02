# 🚀 MAPOS AnyDesk Manager

A modern, beautiful web application for managing AnyDesk IDs for your customers. Built with Next.js 15, Prisma, PostgreSQL, and stunning Aceternity UI components.

## ✨ Features

- 🎨 **Modern UI**: Beautiful, interactive components powered by Aceternity UI
- 🔍 **Smart Search**: Real-time search by customer name or AnyDesk ID
- 🏷️ **Categories**: Organize customers by categories (Office, Retail, Support, etc.)
- 🎯 **One-Click Connect**: Click any customer card to instantly launch AnyDesk
- 📊 **Dashboard Stats**: See total customers, categories, and filtered results at a glance
- ⚡ **Real-time Updates**: Instant UI updates when adding or removing customers
- 🎭 **Smooth Animations**: Fluid animations using Framer Motion
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Custom Aceternity UI components
  - Focus Cards with hover effects
  - Vanishing Input with animated placeholders
  - Wobble Cards for stats
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **TypeScript**: Full type safety

## 📦 Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>
cd desk-db
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up your database**:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` in `.env` with your database credentials

```bash
cp .env.example .env
```

4. **Run database migrations**:
```bash
npx prisma migrate dev --name init
```

5. **Generate Prisma Client**:
```bash
npx prisma generate
```

6. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application!

## 🗄️ Database Schema

```prisma
model Customer {
  id          String   @id @default(cuid())
  name        String
  anydeskId   String   @unique
  category    String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🎯 Usage

### Adding a Customer
1. Click the **"Add Customer"** button in the top right
2. Fill in the customer details:
   - **Name**: Customer or business name
   - **AnyDesk ID**: The unique AnyDesk identifier
   - **Category**: Classification (e.g., Office, Retail, Support)
   - **Notes**: Optional additional information
3. Click **"Add Customer"** to save

### Connecting to a Customer
- Simply click on any customer card to launch AnyDesk with their ID
- AnyDesk will open automatically using the `anydesk:` URL scheme

### Searching & Filtering
- Use the search bar to find customers by name or AnyDesk ID
- Filter by category using the dropdown menu
- Results update in real-time as you type

### Managing Customers
- Click the edit icon to update customer information
- Click the delete icon to remove a customer (with confirmation)

## 🎨 Components

### Focus Cards
Interactive cards that blur siblings when hovered, drawing focus to the selected customer.

### Vanish Input
Beautiful search input with animated placeholders that cycle through different search hints.

### Wobble Card
Stats cards with a subtle 3D wobble effect on hover, perfect for displaying metrics.

## 🔒 Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/deskdb?schema=public"
```

## 📝 API Routes

- `GET /api/customers` - Fetch all customers (with optional search & filter)
- `POST /api/customers` - Create a new customer
- `PUT /api/customers` - Update an existing customer
- `DELETE /api/customers?id={id}` - Delete a customer
- `GET /api/categories` - Get all unique categories

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add your `DATABASE_URL` environment variable
4. Deploy!

### Other Platforms
1. Build the project: `npm run build`
2. Set up your database connection
3. Run migrations: `npx prisma migrate deploy`
4. Start the server: `npm start`

## 🎭 Credits

- UI Components inspired by [Aceternity UI](https://ui.aceternity.com)
- Built with [Next.js](https://nextjs.org)
- Database powered by [Prisma](https://www.prisma.io)

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ for MAPOS Company**
