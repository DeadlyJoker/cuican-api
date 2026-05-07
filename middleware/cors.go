package middleware

import (
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/system_setting"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		config := cors.DefaultConfig()

		allowedOrigins := system_setting.AllowedOrigins

		if allowedOrigins != "" {
			origins := strings.Split(allowedOrigins, ",")
			for i, origin := range origins {
				origins[i] = strings.TrimSpace(origin)
			}
			config.AllowOrigins = origins
			config.AllowCredentials = true
		} else {
			config.AllowAllOrigins = true
			config.AllowCredentials = true
		}

		config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
		config.AllowHeaders = []string{"*"}
		cors.New(config)(c)
	}
}

func PoweredBy() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Cuican-Api-Version", common.Version)
		c.Next()
	}
}
