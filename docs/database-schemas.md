# Lanka Tools Backend: Database Schemas

This backend uses MongoDB with Mongoose. All top-level schemas below use
`timestamps: true`, so MongoDB automatically stores `createdAt` and `updatedAt`.
Every document also receives the MongoDB `_id` (`ObjectId`) field.

`ObjectId -> Collection` denotes a reference to another collection. Fields ending
in `[]` are arrays. Fields marked **optional** may be absent.

## `users` — User

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `email` | string | Required, unique |
| `role` | ObjectId -> `roles` | Required |
| `password` | string | Required; password value is stored by the authentication flow |
| `last_login` | Date | Defaults to the document-creation time |
| `login_ip` | string | Optional |
| `account_stats` | boolean | Required; defaults to `true` (account active) |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `roles` — Role

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `role` | string | Required, unique; one of `super_admin`, `branch_admin`, `staff`, `customer` |
| `permissions` | string[] | Defaults to `[]` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `profiles` — Profile

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required, unique, indexed; one profile per user |
| `first_name` | string | Optional; trimmed |
| `last_name` | string | Optional; trimmed |
| `mobile` | string | Optional; trimmed |
| `address` | Address object | Optional; embedded sub-document |
| `billing_address` | Address object | Optional; embedded sub-document |
| `dob` | Date | Optional |
| `profile_img` | string | Optional |
| `bio` | string | Optional |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

### Embedded `Address` sub-schema

This is not a separate collection and does not have its own `_id`.

| Field | Type | Rules / description |
| --- | --- | --- |
| `address_line_1` | string | Optional |
| `address_line_2` | string | Optional |
| `city` | string | Optional |
| `state` | string | Optional |
| `postal_code` | string | Optional |
| `country` | string | Optional |

## `notifications` — Notification

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `title` | string | Required |
| `description` | string | Required |
| `status` | string | Required; `Read` or `Unread`, default `Unread` |
| `type` | string | Required; `System`, `Notice`, or `Separate`, default `System` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `authtokens` — AuthToken

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `refresh_token_hash` | string | Required |
| `expire_at` | Date | Required |
| `device_id` | string | Optional |
| `ip_address` | string | Optional |
| `user_agent` | string | Optional |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `backupcodes` — BackupCodes

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `backup_codes` | string[] | Required |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `otps` — OTP

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `otp` | string | Defaults to `String` as configured in the current schema |
| `is_used` | boolean | Required; defaults to `false` |
| `expire_at` | Date | Required; defaults to 10 minutes after creation; TTL expiry index |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `categories` — Category

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `category` | string | Required |
| `category_img` | string | Required |
| `category_desc` | string | Required |
| `sub_category` | string[] | Optional |
| `category_stats` | boolean | Required; defaults to `true` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `products` — Product

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `product` | string | Required |
| `description` | string | Required |
| `category` | ObjectId -> `categories` | Required |
| `sub_category` | string[] | Optional |
| `product_imgs` | string[] | Required |
| `hourly_price` | number | Required |
| `daily_price` | number | Required |
| `weekly_price` | number | Required |
| `discount` | number | Defaults to `0` |
| `stock` | number | Required |
| `tags` | string[] | Required |
| `product_status` | boolean | Required; defaults to `true` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `productcomments` — ProductComments

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `product` | ObjectId -> `products` | Required |
| `user` | ObjectId -> `users` | Required |
| `parent_comment` | ObjectId -> `productcomments` | Defaults to `null`; used for replies |
| `comment` | string | Required |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `rentals` — Rental

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `product` | ObjectId -> `products` | Required |
| `hourlyPrice` | number | Required; minimum `0` |
| `dailyPrice` | number | Required; minimum `0` |
| `weeklyPrice` | number | Required; minimum `0` |
| `startDateTime` | Date | Required |
| `endDateTime` | Date | Required |
| `totalHours` | number | Required; minimum `0` |
| `totalDays` | number | Required; minimum `0` |
| `totalWeeks` | number | Required; minimum `0` |
| `subtotal` | number | Required; minimum `0` |
| `vatRate` | number | Required; minimum `0` |
| `vatAmount` | number | Required; minimum `0` |
| `totalAmount` | number | Required; minimum `0` |
| `is_returned` | boolean | Required; defaults to `false` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `overdues` — Overdue

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `product` | ObjectId -> `products` | Required |
| `rentel` | ObjectId -> `rentals` | Required; field name is spelled `rentel` in the implemented schema |
| `override_cost` | number | Required; minimum `0` |
| `is_pay_overdue` | boolean | Required; defaults to `false` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `branches` — Branch

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `branch_admin` | ObjectId -> `users` | Required |
| `branch_name` | string | Required; trimmed |
| `branch_address` | string | Required; trimmed |
| `branch_google_location` | string | Required; trimmed |
| `staff_members` | ObjectId[] -> `users` | Defaults to `[]` |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `systemfiles` — SystemFiles

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `uploader` | ObjectId -> `users` | Required |
| `original_name` | string | Required |
| `filename` | string | Required, unique |
| `mime_type` | string | Required |
| `size` | number | Required |
| `path` | string | Required |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `documentchunks` — DocumentChunk

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `fileId` | ObjectId -> `systemfiles` | Required |
| `chunkIndex` | number | Required |
| `text` | string | Required |
| `embedding` | number[] | Defaults to `[]`; vector embedding for RAG search |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |

## `auditlogs` — AuditLog

| Field | Type | Rules / description |
| --- | --- | --- |
| `_id` | ObjectId | Automatic primary key |
| `user` | ObjectId -> `users` | Required |
| `action` | string | Required |
| `description` | string | Required |
| `ipAddress` | string | Optional |
| `userAgent` | string | Optional |
| `metadata` | object | Optional; may include `ipAddress`, `userAgent`, and other key/value data |
| `createdAt` | Date | Automatic |
| `updatedAt` | Date | Automatic |
