package controller

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

func GetAllOrders(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	filter := parseOrderFilter(c)

	orders, total, err := model.GetAllOrders(filter, pageInfo)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	pageInfo.SetTotal(total)
	pageInfo.SetItems(orders)
	common.ApiSuccess(c, pageInfo)
}

func GetOrderStatistics(c *gin.Context) {
	filter := parseOrderFilter(c)

	stats, err := model.GetOrderStatistics(filter)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	common.ApiSuccess(c, stats)
}

func ExportOrders(c *gin.Context) {
	filter := parseOrderFilter(c)

	orders, err := model.ExportOrders(filter)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=orders.csv")
	c.Writer.WriteHeader(http.StatusOK)

	// BOM for Excel UTF-8 compatibility
	_, _ = c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})

	header := "ID,Type,User ID,Amount,Money,Trade No,Payment Method,Payment Provider,Status,Create Time,Complete Time,Plan ID\n"
	_, _ = c.Writer.WriteString(header)

	for _, o := range orders {
		line := fmt.Sprintf("%d,%s,%d,%d,%.4f,%s,%s,%s,%s,%s,%s,%d\n",
			o.Id,
			o.Type,
			o.UserId,
			o.Amount,
			o.Money,
			csvEscape(o.TradeNo),
			o.PaymentMethod,
			o.PaymentProvider,
			o.Status,
			formatTimestamp(o.CreateTime),
			formatTimestamp(o.CompleteTime),
			o.PlanId,
		)
		_, _ = c.Writer.WriteString(line)
	}
}

func parseOrderFilter(c *gin.Context) model.OrderFilter {
	filter := model.OrderFilter{
		Keyword:       c.Query("keyword"),
		Type:          c.Query("type"),
		Status:        c.Query("status"),
		PaymentMethod: c.Query("payment_method"),
	}

	if userId, err := strconv.Atoi(c.Query("user_id")); err == nil && userId > 0 {
		filter.UserId = userId
	}
	if startTime, err := strconv.ParseInt(c.Query("start_time"), 10, 64); err == nil {
		filter.StartTime = startTime
	}
	if endTime, err := strconv.ParseInt(c.Query("end_time"), 10, 64); err == nil {
		filter.EndTime = endTime
	}

	return filter
}

func csvEscape(s string) string {
	if strings.ContainsAny(s, ",\"\n") {
		return `"` + strings.ReplaceAll(s, `"`, `""`) + `"`
	}
	return s
}

func formatTimestamp(ts int64) string {
	if ts == 0 {
		return ""
	}
	return fmt.Sprintf("%d", ts)
}
