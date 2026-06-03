$backendDir = "$PSScriptRoot\backend"

$dirs = @(
  "prisma/migrations",
  "src/config",
  "src/common/constants",
  "src/common/utils",
  "src/common/middlewares",
  "src/modules/auth",
  "src/modules/users",
  "src/modules/categories",
  "src/modules/products",
  "src/modules/designs",
  "src/modules/stickers",
  "src/modules/cart",
  "src/modules/orders",
  "src/modules/inventory",
  "src/modules/promotions",
  "src/modules/payments",
  "src/modules/reports",
  "src/modules/uploads",
  "src/routes",
  "src/database"
)

$files = @(
  "prisma/schema.prisma",
  "prisma/seed.js",
  "src/app.js",
  "src/server.js",
  "src/config/env.js",
  "src/config/cors.js",
  "src/config/cloudinary.js",
  "src/config/redis.js",
  "src/config/vnpay.js",
  "src/common/constants/roles.js",
  "src/common/constants/orderStatus.js",
  "src/common/constants/paymentStatus.js",
  "src/common/utils/slug.js",
  "src/common/utils/pagination.js",
  "src/common/utils/price.js",
  "src/common/utils/response.js",
  "src/common/middlewares/auth.middleware.js",
  "src/common/middlewares/role.middleware.js",
  "src/common/middlewares/error.middleware.js",
  "src/common/middlewares/validate.middleware.js",
  "src/common/middlewares/upload.middleware.js",
  "src/modules/auth/auth.routes.js",
  "src/modules/auth/auth.controller.js",
  "src/modules/auth/auth.service.js",
  "src/modules/users/user.routes.js",
  "src/modules/users/user.controller.js",
  "src/modules/users/user.service.js",
  "src/modules/categories/category.routes.js",
  "src/modules/categories/category.controller.js",
  "src/modules/categories/category.service.js",
  "src/modules/products/product.routes.js",
  "src/modules/products/product.controller.js",
  "src/modules/products/product.service.js",
  "src/modules/designs/design.routes.js",
  "src/modules/designs/design.controller.js",
  "src/modules/designs/design.service.js",
  "src/modules/stickers/sticker.routes.js",
  "src/modules/stickers/sticker.controller.js",
  "src/modules/stickers/sticker.service.js",
  "src/modules/cart/cart.routes.js",
  "src/modules/cart/cart.controller.js",
  "src/modules/cart/cart.service.js",
  "src/modules/orders/order.routes.js",
  "src/modules/orders/order.controller.js",
  "src/modules/orders/order.service.js",
  "src/modules/inventory/inventory.routes.js",
  "src/modules/inventory/inventory.controller.js",
  "src/modules/inventory/inventory.service.js",
  "src/modules/promotions/promotion.routes.js",
  "src/modules/promotions/promotion.controller.js",
  "src/modules/promotions/promotion.service.js",
  "src/modules/payments/payment.routes.js",
  "src/modules/payments/payment.controller.js",
  "src/modules/payments/payment.service.js",
  "src/modules/reports/report.routes.js",
  "src/modules/reports/report.controller.js",
  "src/modules/reports/report.service.js",
  "src/modules/uploads/upload.routes.js",
  "src/modules/uploads/upload.controller.js",
  "src/modules/uploads/upload.service.js",
  "src/routes/index.js",
  "src/database/prisma.js",
  ".env",
  "package.json"
)

foreach ($dir in $dirs) {
  $path = Join-Path $backendDir $dir
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
  }
}

foreach ($file in $files) {
  $path = Join-Path $backendDir $file
  if (-not (Test-Path $path)) {
    New-Item -ItemType File -Force -Path $path | Out-Null
  }
}

Write-Host "Folder backend created successfully!"
