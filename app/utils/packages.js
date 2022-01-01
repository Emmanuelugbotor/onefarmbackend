exports.routeParams = ["/", "/features", "/faq", "/login", "/register"];

exports.imageParams = ["image/jpeg", "image/png", "image/jpg", "image/JPG", "image/gif"];

exports.usersDB = "miningusers"

exports.usersReceiptsDB = "receipts"

exports.withdrawalDB = "withdrawal"
 
exports.adminDB = "miningadmin"

exports.contactDB = "contact"

/*
Trial package $100-  $999 4% ROI daily for 6 days 
Premium package $1,000-  $19,999 5% ROI daily for 6 days.
Full membership  $20,000- $99,999 6% ROI daily for 6 days 
Diamond package $100,000- $499,999 7% ROI daily for 6 days 
Special Trades $500,000 - No maximum 8% ROI daily for 6 days

number of ref 
*/ 
exports.Packages={
    Packages:{
        Trial:{
            Price: 100,
            Price2: 999,
            Duration: "6 days",
            Returns: "4% daily"
        },
        Premium:{
            Price: 1000,
            Price2: 19999,
            Duration: "6 days",
            Returns: "5% daily" 
        },
        Full:{
            Price: 20000,
            Price2: 99999,
            Duration: "6 days",
            Returns: "6% daily",
        },

        Diamond:{
            Price: 100000,
            Price2: 499999,
            Duration: "6 days",
            Returns: "7% daily"
        },

        Special:{
            Price: 500000,
            Duration: "6 days",
            Returns: "8% daily",
        }
    }
}