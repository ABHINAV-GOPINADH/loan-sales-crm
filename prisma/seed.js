const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean tables
  await prisma.dailyTarget.deleteMany({});
  await prisma.callLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.loanApplication.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.loanScheme.deleteMany({});
  await prisma.bank.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const staffPassword = await bcrypt.hash("Staff@123", 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin Officer",
      email: "admin@cloudhouse.com",
      password: adminPassword,
      role: "ADMIN",
      phone: "+91 98765 00001",
      isActive: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "staff1@cloudhouse.com",
      password: staffPassword,
      role: "STAFF",
      phone: "+91 98765 11101",
      isActive: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "staff2@cloudhouse.com",
      password: staffPassword,
      role: "STAFF",
      phone: "+91 98765 11102",
      isActive: true,
    },
  });

  const staff3 = await prisma.user.create({
    data: {
      name: "Amit Verma",
      email: "staff3@cloudhouse.com",
      password: staffPassword,
      role: "STAFF",
      phone: "+91 98765 11103",
      isActive: true,
    },
  });

  const staff4 = await prisma.user.create({
    data: {
      name: "Sneha Rao",
      email: "staff4@cloudhouse.com",
      password: staffPassword,
      role: "STAFF",
      phone: "+91 98765 11104",
      isActive: true,
    },
  });

  const staffMembers = [staff1, staff2, staff3, staff4];

  // 2. Daily Targets for Today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];
  const targetData = [
    { user: staff1, completed: 86, interested: 14 },
    { user: staff2, completed: 102, interested: 18 },
    { user: staff3, completed: 48, interested: 6 },
    { user: staff4, completed: 67, interested: 11 },
  ];

  for (const t of targetData) {
    await prisma.dailyTarget.create({
      data: {
        userId: t.user.id,
        date: todayStr,
        targetCalls: 100,
        completedCalls: t.completed,
        interestedCount: t.interested,
      },
    });
  }

  // 3. Banks & Schemes
  const hdfc = await prisma.bank.create({
    data: {
      name: "HDFC Bank",
      contactPerson: "Vikram Malhotra",
      contactPhone: "+91 98200 45678",
      contactEmail: "loans@hdfcbank.com",
      isActive: true,
      schemes: {
        create: [
          {
            name: "HDFC Personal Loan QuickDisburse",
            loanType: "PERSONAL",
            minInterest: 10.5,
            maxInterest: 14.5,
            minAmount: 50000,
            maxAmount: 4000000,
            tenureMonths: 60,
            processingFee: 1.5,
          },
          {
            name: "HDFC Home Loan Reach",
            loanType: "HOME",
            minInterest: 8.4,
            maxInterest: 9.3,
            minAmount: 500000,
            maxAmount: 50000000,
            tenureMonths: 240,
            processingFee: 0.5,
          },
        ],
      },
    },
  });

  const icici = await prisma.bank.create({
    data: {
      name: "ICICI Bank",
      contactPerson: "Ananya Deshmukh",
      contactPhone: "+91 98201 56789",
      contactEmail: "loans@icicibank.com",
      isActive: true,
      schemes: {
        create: [
          {
            name: "ICICI Insta Business Growth",
            loanType: "BUSINESS",
            minInterest: 11.75,
            maxInterest: 15.5,
            minAmount: 200000,
            maxAmount: 7500000,
            tenureMonths: 84,
            processingFee: 1.25,
          },
          {
            name: "ICICI Car Loan Express",
            loanType: "VEHICLE",
            minInterest: 8.75,
            maxInterest: 10.5,
            minAmount: 100000,
            maxAmount: 3000000,
            tenureMonths: 60,
            processingFee: 1.0,
          },
        ],
      },
    },
  });

  const sbi = await prisma.bank.create({
    data: {
      name: "State Bank of India (SBI)",
      contactPerson: "Rajesh Kumar",
      contactPhone: "+91 98202 67890",
      contactEmail: "crm.loans@sbi.co.in",
      isActive: true,
      schemes: {
        create: [
          {
            name: "SBI Global Ed-Vantage Education Loan",
            loanType: "EDUCATION",
            minInterest: 8.15,
            maxInterest: 9.5,
            minAmount: 100000,
            maxAmount: 4000000,
            tenureMonths: 120,
            processingFee: 0.75,
          },
          {
            name: "SBI Regular Home Loan Advantage",
            loanType: "HOME",
            minInterest: 8.5,
            maxInterest: 9.25,
            minAmount: 300000,
            maxAmount: 70000000,
            tenureMonths: 360,
            processingFee: 0.35,
          },
        ],
      },
    },
  });

  const allSchemes = await prisma.loanScheme.findMany();

  // 4. Sample Leads & Associated Workflow
  const sampleLeads = [
    { name: "Sunil Kulkarni", phone: "9823011221", email: "sunil.k@gmail.com", city: "Mumbai", amount: 1500000, status: "DISBURSED", assignedToId: staff1.id },
    { name: "Deepak Mehra", phone: "9823011222", email: "deepak.m@yahoo.com", city: "Delhi", amount: 2500000, status: "APPROVED", assignedToId: staff1.id },
    { name: "Kavita Reddy", phone: "9823011223", email: "kavita.r@gmail.com", city: "Hyderabad", amount: 500000, status: "APPLIED", assignedToId: staff1.id },
    { name: "Manish Agarwal", phone: "9823011224", email: "manish.a@outlook.com", city: "Bangalore", amount: 800000, status: "DOCS_COLLECTED", assignedToId: staff1.id },
    { name: "Neeta Joshi", phone: "9823011225", email: "neeta.j@gmail.com", city: "Pune", amount: 350000, status: "DOCS_PENDING", assignedToId: staff1.id },
    { name: "Rohan Kapoor", phone: "9823011226", email: "rohan.k@gmail.com", city: "Mumbai", amount: 4500000, status: "INTERESTED", assignedToId: staff1.id },
    { name: "Suresh Pillai", phone: "9823011227", email: "suresh.p@gmail.com", city: "Chennai", amount: 200000, status: "NOT_INTERESTED", assignedToId: staff1.id },
    { name: "Pooja Hegde", phone: "9823011228", email: "pooja.h@gmail.com", city: "Bangalore", amount: 1200000, status: "CONTACTED", assignedToId: staff1.id },
    { name: "Arjun Nair", phone: "9823011229", email: "arjun.n@gmail.com", city: "Kochi", amount: 600000, status: "NEW", assignedToId: staff1.id },

    { name: "Gaurav Bansal", phone: "9823011230", email: "gaurav.b@gmail.com", city: "Jaipur", amount: 3000000, status: "DISBURSED", assignedToId: staff2.id },
    { name: "Tanvi Saxena", phone: "9823011231", email: "tanvi.s@gmail.com", city: "Noida", amount: 1800000, status: "APPROVED", assignedToId: staff2.id },
    { name: "Akash Singhania", phone: "9823011232", email: "akash.s@gmail.com", city: "Kolkata", amount: 5000000, status: "APPLIED", assignedToId: staff2.id },
    { name: "Shweta Tiwari", phone: "9823011233", email: "shweta.t@gmail.com", city: "Lucknow", amount: 750000, status: "DOCS_COLLECTED", assignedToId: staff2.id },
    { name: "Vikas Dubey", phone: "9823011234", email: "vikas.d@gmail.com", city: "Kanpur", amount: 400000, status: "INTERESTED", assignedToId: staff2.id },
    { name: "Meera Menon", phone: "9823011235", email: "meera.m@gmail.com", city: "Trivandrum", amount: 1500000, status: "CONTACTED", assignedToId: staff2.id },
    { name: "Alok Gupta", phone: "9823011236", email: "alok.g@gmail.com", city: "Delhi", amount: 900000, status: "NEW", assignedToId: staff2.id },

    { name: "Kunal Ghosh", phone: "9823011237", email: "kunal.g@gmail.com", city: "Kolkata", amount: 2200000, status: "INTERESTED", assignedToId: staff3.id },
    { name: "Ritu Chawla", phone: "9823011238", email: "ritu.c@gmail.com", city: "Chandigarh", amount: 1100000, status: "DOCS_PENDING", assignedToId: staff3.id },
    { name: "Tarun Bajaj", phone: "9823011239", email: "tarun.b@gmail.com", city: "Gurgaon", amount: 4000000, status: "APPLIED", assignedToId: staff3.id },
    { name: "Harish Iyer", phone: "9823011240", email: "harish.i@gmail.com", city: "Mumbai", amount: 650000, status: "NOT_INTERESTED", assignedToId: staff3.id },
    { name: "Divya Nambiar", phone: "9823011241", email: "divya.n@gmail.com", city: "Calicut", amount: 850000, status: "NEW", assignedToId: staff3.id },

    { name: "Nikhil Bhatt", phone: "9823011242", email: "nikhil.b@gmail.com", city: "Ahmedabad", amount: 3500000, status: "DISBURSED", assignedToId: staff4.id },
    { name: "Bhavna Patel", phone: "9823011243", email: "bhavna.p@gmail.com", city: "Surat", amount: 1600000, status: "APPROVED", assignedToId: staff4.id },
    { name: "Sameer Sheikh", phone: "9823011244", email: "sameer.s@gmail.com", city: "Nagpur", amount: 950000, status: "INTERESTED", assignedToId: staff4.id },
    { name: "Pallavi Sen", phone: "9823011245", email: "pallavi.s@gmail.com", city: "Bhubaneswar", amount: 500000, status: "NEW", assignedToId: staff4.id },

    // Unassigned pool for Admin distribution testing
    { name: "Yashvardhan Roy", phone: "9823011246", email: "yash.roy@gmail.com", city: "Indore", amount: 1200000, status: "NEW", assignedToId: null },
    { name: "Anil Deshpande", phone: "9823011247", email: "anil.d@gmail.com", city: "Pune", amount: 2800000, status: "NEW", assignedToId: null },
    { name: "Geeta Somani", phone: "9823011248", email: "geeta.s@gmail.com", city: "Bhopal", amount: 750000, status: "NEW", assignedToId: null },
    { name: "Farhan Khan", phone: "9823011249", email: "farhan.k@gmail.com", city: "Hyderabad", amount: 1400000, status: "NEW", assignedToId: null },
    { name: "Madhu Shalini", phone: "9823011250", email: "madhu.s@gmail.com", city: "Vijayawada", amount: 2100000, status: "NEW", assignedToId: null },
  ];

  for (const item of sampleLeads) {
    const createdLead = await prisma.lead.create({
      data: {
        name: item.name,
        phone: item.phone,
        email: item.email,
        city: item.city,
        loanAmount: item.amount,
        source: item.assignedToId ? "MANUAL" : "BULK_UPLOAD",
        status: item.status,
        assignedToId: item.assignedToId,
        assignedAt: item.assignedToId ? new Date() : null,
      },
    });

    // Create call logs if contacted or beyond
    if (item.assignedToId && item.status !== "NEW") {
      await prisma.callLog.create({
        data: {
          leadId: createdLead.id,
          userId: item.assignedToId,
          callStatus: "CONNECTED",
          remarks: `Initial call completed. Customer discussed loan requirement of Rs. ${item.amount.toLocaleString()}. Current stage: ${item.status}.`,
          interested: item.status !== "NOT_INTERESTED",
          followUpDate: item.status === "INTERESTED" ? new Date(Date.now() + 86400000 * 2) : null,
        },
      });
    }

    // Create documents if DOCS_COLLECTED, APPLIED, APPROVED, DISBURSED
    if (["DOCS_COLLECTED", "APPLIED", "APPROVED", "DISBURSED"].includes(item.status)) {
      await prisma.document.createMany({
        data: [
          {
            leadId: createdLead.id,
            docType: "AADHAAR",
            fileName: "aadhaar_card_front_back.pdf",
            fileUrl: "/sample-docs/aadhaar_sample.pdf",
            status: "VERIFIED",
            remarks: "Clear copy, UID verified",
            verifiedBy: "Admin Officer",
            verifiedAt: new Date(),
          },
          {
            leadId: createdLead.id,
            docType: "PAN",
            fileName: "pan_card.jpg",
            fileUrl: "/sample-docs/pan_sample.jpg",
            status: "VERIFIED",
            remarks: "PAN validated via NSDL",
            verifiedBy: "Admin Officer",
            verifiedAt: new Date(),
          },
          {
            leadId: createdLead.id,
            docType: "SALARY_SLIP",
            fileName: "last_3_months_salary.pdf",
            fileUrl: "/sample-docs/salary_sample.pdf",
            status: item.status === "DOCS_COLLECTED" ? "PENDING" : "VERIFIED",
            remarks: item.status === "DOCS_COLLECTED" ? "Under finance review" : "Net pay exceeds 75k/month",
            verifiedBy: item.status === "DOCS_COLLECTED" ? null : "Admin Officer",
            verifiedAt: item.status === "DOCS_COLLECTED" ? null : new Date(),
          },
        ],
      });
    }

    // Create loan application if APPLIED, APPROVED, DISBURSED
    if (["APPLIED", "APPROVED", "DISBURSED"].includes(item.status)) {
      const scheme = allSchemes[Math.floor(Math.random() * allSchemes.length)];
      await prisma.loanApplication.create({
        data: {
          leadId: createdLead.id,
          schemeId: scheme.id,
          handledById: item.assignedToId,
          appliedAmount: item.amount,
          approvedAmount: item.status === "DISBURSED" || item.status === "APPROVED" ? item.amount * 0.95 : null,
          status: item.status === "DISBURSED" ? "DISBURSED" : item.status === "APPROVED" ? "APPROVED" : "UNDER_REVIEW",
          bankRefNumber: `BNK-APP-${10000 + createdLead.id}`,
          adminRemarks: item.status === "DISBURSED" ? "Disbursed to customer bank account directly by partner bank" : item.status === "APPROVED" ? "Sanction letter issued" : "Documentation forwarded to credit team",
          approvedAt: item.status !== "APPLIED" ? new Date(Date.now() - 86400000 * 2) : null,
          disbursedAt: item.status === "DISBURSED" ? new Date(Date.now() - 86400000 * 1) : null,
        },
      });
    }
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
