package middleware

import (
	"os"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	config := cors.DefaultConfig()
	
	// 从环境变量读取允许的域名列表，用逗号分隔
	// 例如: ALLOWED_ORIGINS=https://example.com,https://app.example.com
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	
	if allowedOrigins != "" {
		// 配置了白名单，使用白名单模式
		origins := strings.Split(allowedOrigins, ",")
		for i, origin := range origins {
			origins[i] = strings.TrimSpace(origin)
		}
		config.AllowOrigins = origins
		config.AllowCredentials = true
	} else {
		// 未配置白名单，开发模式：允许所有来源
		config.AllowAllOrigins = true
		config.AllowCredentials = true
	}
	
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"*"}
	return cors.New(config)
}

func PoweredBy() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Cuican-Api-Version", common.Version)
		c.Next()
	}
}
