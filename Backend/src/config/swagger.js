import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "🎫 تذكرتي API",
      version: "1.0.0",
      description: `
# Event Management System API

نظام إدارة الفعاليات والأحداث المتكامل مع نظام حجز وتذاكر آمن.

## الميزات الرئيسية
- 🔐 نظام مصادقة متقدم مع JWT
- 🎟️ إدارة الأحداث والتذاكر
- 💳 نظام دفع آمن مع Checkout.com
- 📊 لوحات تحكم للمنظمين
- 🔍 التحقق من التذاكر بـ QR Code
- 📧 نظام إشعارات بالبريد الإلكتروني

## الأمان
جميع الـ APIs المحمية تتطلب JWT token في header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## رموز الاستجابة
- \`200\` - نجح الطلب
- \`201\` - تم الإنشاء بنجاح
- \`400\` - خطأ في البيانات المرسلة
- \`401\` - غير مصرح بالوصول
- \`403\` - ممنوع
- \`404\` - غير موجود
- \`500\` - خطأ في الخادم
      `,
      contact: {
        name: "Tazkarti Support",
        email: "support@tazkarti.com",
        url: "https://tazkarti.com/support",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: process.env.APP_BASE_URL || "http://localhost:5000",
        description: "Development Server",
      },
      {
        url: "https://tazkarti-backend.fly.dev",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Unauthorized" },
                },
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error in request data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Validation failed" },
                  errors: {
                    type: "array",
                    items: { type: "string" },
                    example: [
                      "Email is required",
                      "Password must be at least 6 characters",
                    ],
                  },
                },
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string", example: "Internal server error" },
                  error: {
                    type: "string",
                    example: "Database connection failed",
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["userName", "email", "password"],
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userName: { type: "string", example: "ahmed_mohamed" },
            email: {
              type: "string",
              format: "email",
              example: "ahmed@example.com",
            },
            phone: { type: "string", example: "+201234567890" },
            role: {
              type: "string",
              enum: ["user", "organizer", "admin"],
              default: "user",
            },
            isVerified: { type: "boolean", default: false },
            avatar: {
              type: "string",
              example: "https://example.com/avatar.jpg",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
              example: "1990-05-15",
            },
            gender: {
              type: "string",
              enum: ["male", "female"],
              example: "male",
            },
            preferences: {
              type: "object",
              properties: {
                language: { type: "string", example: "ar" },
                notifications: { type: "boolean", default: true },
                emailUpdates: { type: "boolean", default: true },
              },
            },
            ticketsBooked: {
              type: "array",
              items: { type: "string" },
              example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        UserRegistration: {
          type: "object",
          required: ["userName", "email", "password"],
          properties: {
            userName: {
              type: "string",
              minLength: 3,
              maxLength: 20,
              example: "ahmed_mohamed",
            },
            email: {
              type: "string",
              format: "email",
              example: "ahmed@example.com",
            },
            password: { type: "string", minLength: 6, example: "password123" },
            phone: { type: "string", example: "+201234567890" },
            dateOfBirth: {
              type: "string",
              format: "date",
              example: "1990-05-15",
            },
            gender: {
              type: "string",
              enum: ["male", "female"],
              example: "male",
            },
          },
        },

        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "ahmed@example.com",
            },
            password: { type: "string", example: "password123" },
          },
        },

        // Event Schemas
        Event: {
          type: "object",
          required: [
            "title",
            "description",
            "startDate",
            "endDate",
            "location",
            "organizer",
          ],
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439014" },
            title: { type: "string", example: "مؤتمر التكنولوجيا 2024" },
            description: {
              type: "string",
              example: "مؤتمر تقني يجمع أفضل المطورين في المنطقة",
            },
            startDate: {
              type: "string",
              format: "date-time",
              example: "2024-06-15T10:00:00Z",
            },
            endDate: {
              type: "string",
              format: "date-time",
              example: "2024-06-15T18:00:00Z",
            },
            location: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  example: "مركز الرياض الدولي للمؤتمرات",
                },
                city: { type: "string", example: "الرياض" },
                country: { type: "string", example: "السعودية" },
                coordinates: {
                  type: "object",
                  properties: {
                    lat: { type: "number", example: 24.7136 },
                    lng: { type: "number", example: 46.6753 },
                  },
                },
              },
            },
            category: {
              type: "string",
              enum: [
                "technology",
                "business",
                "entertainment",
                "sports",
                "education",
                "health",
              ],
              example: "technology",
            },
            organizer: { type: "string", example: "507f1f77bcf86cd799439015" },
            images: {
              type: "array",
              items: { type: "string" },
              example: [
                "https://example.com/event1.jpg",
                "https://example.com/event2.jpg",
              ],
            },
            maxAttendees: { type: "number", example: 500 },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["تقنية", "برمجة", "ذكي_اصطناعي"],
            },
            status: {
              type: "string",
              enum: ["draft", "published", "cancelled", "completed"],
              default: "draft",
            },
            isActive: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        EventCreate: {
          type: "object",
          required: [
            "title",
            "description",
            "startDate",
            "endDate",
            "location",
          ],
          properties: {
            title: { type: "string", example: "مؤتمر التكنولوجيا 2024" },
            description: {
              type: "string",
              example: "مؤتمر تقني يجمع أفضل المطورين",
            },
            startDate: {
              type: "string",
              format: "date-time",
              example: "2024-06-15T10:00:00Z",
            },
            endDate: {
              type: "string",
              format: "date-time",
              example: "2024-06-15T18:00:00Z",
            },
            location: {
              type: "object",
              properties: {
                address: {
                  type: "string",
                  example: "مركز الرياض الدولي للمؤتمرات",
                },
                city: { type: "string", example: "الرياض" },
                country: { type: "string", example: "السعودية" },
              },
            },
            category: { type: "string", example: "technology" },
            maxAttendees: { type: "number", example: 500 },
            tags: { type: "array", items: { type: "string" } },
          },
        },

        // Ticket Schemas
        Ticket: {
          type: "object",
          required: ["event", "type", "price", "quantity"],
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439016" },
            event: { type: "string", example: "507f1f77bcf86cd799439014" },
            type: {
              type: "string",
              enum: ["regular", "vip", "premium", "student", "early_bird"],
              example: "regular",
            },
            price: { type: "number", example: 299.99 },
            currency: { type: "string", default: "EGP", example: "EGP" },
            quantity: { type: "number", example: 100 },
            availableQuantity: { type: "number", example: 85 },
            description: {
              type: "string",
              example: "تذكرة عادية تتضمن الحضور والوجبات",
            },
            features: {
              type: "array",
              items: { type: "string" },
              example: ["حضور جميع الجلسات", "وجبة غداء", "شهادة مشاركة"],
            },
            saleStartDate: { type: "string", format: "date-time" },
            saleEndDate: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["active", "inactive", "sold_out"],
              default: "active",
            },
            isActive: { type: "boolean", default: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Booking Schemas
        Booking: {
          type: "object",
          required: ["user", "event", "ticket", "quantity", "totalPrice"],
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439017" },
            bookingCode: { type: "string", example: "BOOK-12345678" },
            user: { type: "string", example: "507f1f77bcf86cd799439011" },
            event: { type: "string", example: "507f1f77bcf86cd799439014" },
            ticket: { type: "string", example: "507f1f77bcf86cd799439016" },
            quantity: { type: "number", example: 2 },
            totalPrice: { type: "number", example: 599.98 },
            status: {
              type: "string",
              enum: ["pending", "confirmed", "cancelled", "expired"],
              default: "pending",
            },
            paymentStatus: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "completed",
                "failed",
                "refunded",
                "expired",
              ],
              default: "pending",
            },
            paymentMethod: { type: "string", example: "card" },
            transactionId: { type: "string", example: "pay_abc123def456" },
            attendeeInfo: {
              type: "object",
              properties: {
                name: { type: "string", example: "أحمد محمد" },
                email: { type: "string", example: "ahmed@example.com" },
                phone: { type: "string", example: "+201234567890" },
              },
            },
            qrCode: { type: "string", example: "data:image/png;base64,..." },
            checkedIn: { type: "boolean", default: false },
            checkedInAt: { type: "string", format: "date-time" },
            paymentDate: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        BookingCreate: {
          type: "object",
          required: ["ticketId", "eventId", "type", "quantity"],
          properties: {
            ticketId: { type: "string", example: "507f1f77bcf86cd799439016" },
            eventId: { type: "string", example: "507f1f77bcf86cd799439014" },
            type: { type: "string", example: "regular" },
            quantity: { type: "number", minimum: 1, maximum: 10, example: 2 },
            paymentMethod: {
              type: "string",
              enum: ["card", "wallet"],
              default: "card",
            },
          },
        },

        // Payment Schemas
        Payment: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439018" },
            booking: { type: "string", example: "507f1f77bcf86cd799439017" },
            user: { type: "string", example: "507f1f77bcf86cd799439011" },
            paymentId: { type: "string", example: "pay_abc123def456" },
            transactionId: { type: "string", example: "txn_xyz789abc123" },
            paymentMethod: { type: "string", example: "card" },
            amount: { type: "number", example: 599.98 },
            currency: { type: "string", example: "EGP" },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "authorized",
                "captured",
                "failed",
                "cancelled",
                "refunded",
              ],
              example: "captured",
            },
            gatewayResponse: {
              type: "object",
              properties: {
                responseCode: { type: "string", example: "10000" },
                responseMessage: { type: "string", example: "Approved" },
                approvalCode: { type: "string", example: "123456" },
              },
            },
            webhookVerified: { type: "boolean", default: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // Common Response Schemas
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: { type: "object" },
          },
        },

        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
            error: { type: "string" },
          },
        },

        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "array", items: {} },
            pagination: {
              type: "object",
              properties: {
                currentPage: { type: "number", example: 1 },
                totalPages: { type: "number", example: 5 },
                totalItems: { type: "number", example: 47 },
                hasNext: { type: "boolean", example: true },
                hasPrev: { type: "boolean", example: false },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "🔐 Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "👤 Users",
        description: "User management and profiles",
      },
      {
        name: "🎭 Events",
        description: "Event creation and management",
      },
      {
        name: "🎟️ Tickets",
        description: "Ticket management and verification",
      },
      {
        name: "📝 Bookings",
        description: "Booking management for users and organizers",
      },
      {
        name: "💳 Payments",
        description: "Payment processing and webhooks",
      },
      {
        name: "💬 Chat",
        description: "Chat and messaging system",
      },
    ],
  },
  apis: [
    "./src/swagger/*.js", // مسار ملفات توثيق Swagger
  ],
};

// إنشاء Swagger specification
const specs = swaggerJSDoc(options);

// إعدادات UI مخصصة
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2c3e50; }
    .swagger-ui .scheme-container { background: #f8f9fa; }
    .swagger-ui .btn.authorize {
      background-color: #27ae60;
      border-color: #27ae60;
    }
    .swagger-ui .btn.authorize:hover {
      background-color: #219a52;
    }
  `,
  customSiteTitle: "تذكرتي API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
};

export { specs, swaggerUiOptions };
