/* eslint-disable import/no-anonymous-default-export */
// export default {
//     host:
//         process.env.NODE_ENV === "production"
//             ? (process.env.BASE_URL_PROD || process.env.NEXT_PUBLIC_BASE_URL_PROD || "https://api2.nariaholidays.com")
//             : (process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://172.16.0.82:5010"),
//     host_aws:
//         process.env.NODE_ENV === "production"
//             ? (process.env.AWS_BASE_URL_PROD || process.env.NEXT_PUBLIC_AWS_BASE_URL_PROD || "https://api2.nariaholidays.com")
//             : (process.env.AWS_BASE_URL || process.env.NEXT_PUBLIC_AWS_BASE_URL || "http://172.16.0.82:5010"),
//     host_front:
//         process.env.NODE_ENV === "production"
//             ? (process.env.FRONT_BASE_URL_PROD || process.env.NEXT_PUBLIC_FRONT_URL_PROD || "https://dashboard.nariaholidays.com")
//             : (process.env.FRONT_BASE_URL || process.env.NEXT_PUBLIC_FRONT_URL || "http://localhost:3005"),
//     aws_cdn_url: process.env.AWS_CDN || process.env.NEXT_PUBLIC_AWS_CDN_URL || "https://djht95tjlbcen.cloudfront.net",
//     google_client_id:
//         process.env.GOOGLE_CLIENT_ID ||
//         process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
//         "370878724555-kklfkukn3mh76n9ce3naau6mgs9bflis.apps.googleusercontent.com",
//     crypto_key: process.env.NEXT_CRYPTO_KEY || "ceklfkukn3naau6mgs9bflis",
//     pusher_public_key: process.env.NEXT_PUBLIC_PUSHER_KEY || "a05120361847f3750662",
//     pusher_cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
// };

export default {
    host: "https://api2.nariaholidays.com",
    host_aws: "https://api2.nariaholidays.com",
    host_front: "https://dashboard.nariaholidays.com",
    aws_cdn_url: "https://djht95tjlbcen.cloudfront.net",
    google_client_id:
        "370878724555-kklfkukn3mh76n9ce3naau6mgs9bflis.apps.googleusercontent.com",
    crypto_key: "ceklfkukn3naau6mgs9bflis",
    pusher_public_key: "116fc04fbc8b2f1d8206",
    pusher_cluster: "ap2",
};

// cors 
// https://api2.nariaholidays.com,