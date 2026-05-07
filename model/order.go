package model

import (
	"sort"
	"time"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

const (
	OrderTypeTopUp        = "topup"
	OrderTypeSubscription = "subscription"
)

type UnifiedOrder struct {
	Id              int     `json:"id"`
	Type            string  `json:"type"`
	UserId          int     `json:"user_id"`
	Amount          int64   `json:"amount"`
	Money           float64 `json:"money"`
	TradeNo         string  `json:"trade_no"`
	PaymentMethod   string  `json:"payment_method"`
	PaymentProvider string  `json:"payment_provider"`
	Status          string  `json:"status"`
	CreateTime      int64   `json:"create_time"`
	CompleteTime    int64   `json:"complete_time"`
	PlanId          int     `json:"plan_id,omitempty"`
}

type OrderFilter struct {
	Keyword       string
	Type          string
	Status        string
	PaymentMethod string
	UserId        int
	StartTime     int64
	EndTime       int64
}

type OrderStatistics struct {
	TotalRevenue       float64                `json:"total_revenue"`
	TotalOrders        int64                  `json:"total_orders"`
	SuccessOrders      int64                  `json:"success_orders"`
	PendingOrders      int64                  `json:"pending_orders"`
	SuccessRate        float64                `json:"success_rate"`
	AverageOrderValue  float64                `json:"average_order_value"`
	RevenueByMethod    []MethodRevenue        `json:"revenue_by_method"`
	RevenueByType      []TypeRevenue          `json:"revenue_by_type"`
	RevenueTrend       []RevenueTrendPoint    `json:"revenue_trend"`
}

type MethodRevenue struct {
	Method  string  `json:"method"`
	Revenue float64 `json:"revenue"`
	Count   int64   `json:"count"`
}

type TypeRevenue struct {
	Type    string  `json:"type"`
	Revenue float64 `json:"revenue"`
	Count   int64   `json:"count"`
}

type RevenueTrendPoint struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
	Count   int64   `json:"count"`
}

func buildTopUpQuery(filter OrderFilter) *gorm.DB {
	query := DB.Model(&TopUp{})
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.PaymentMethod != "" {
		query = query.Where("payment_method = ?", filter.PaymentMethod)
	}
	if filter.UserId > 0 {
		query = query.Where("user_id = ?", filter.UserId)
	}
	if filter.StartTime > 0 {
		query = query.Where("create_time >= ?", filter.StartTime)
	}
	if filter.EndTime > 0 {
		query = query.Where("create_time <= ?", filter.EndTime)
	}
	if filter.Keyword != "" {
		query = query.Where("trade_no LIKE ?", "%"+filter.Keyword+"%")
	}
	return query
}

func buildSubOrderQuery(filter OrderFilter) *gorm.DB {
	query := DB.Model(&SubscriptionOrder{})
	if filter.Status != "" {
		query = query.Where("status = ?", filter.Status)
	}
	if filter.PaymentMethod != "" {
		query = query.Where("payment_method = ?", filter.PaymentMethod)
	}
	if filter.UserId > 0 {
		query = query.Where("user_id = ?", filter.UserId)
	}
	if filter.StartTime > 0 {
		query = query.Where("create_time >= ?", filter.StartTime)
	}
	if filter.EndTime > 0 {
		query = query.Where("create_time <= ?", filter.EndTime)
	}
	if filter.Keyword != "" {
		query = query.Where("trade_no LIKE ?", "%"+filter.Keyword+"%")
	}
	return query
}

func topUpToUnified(t *TopUp) UnifiedOrder {
	return UnifiedOrder{
		Id:              t.Id,
		Type:            OrderTypeTopUp,
		UserId:          t.UserId,
		Amount:          t.Amount,
		Money:           t.Money,
		TradeNo:         t.TradeNo,
		PaymentMethod:   t.PaymentMethod,
		PaymentProvider: t.PaymentProvider,
		Status:          t.Status,
		CreateTime:      t.CreateTime,
		CompleteTime:    t.CompleteTime,
	}
}

func subOrderToUnified(s *SubscriptionOrder) UnifiedOrder {
	return UnifiedOrder{
		Id:              s.Id,
		Type:            OrderTypeSubscription,
		UserId:          s.UserId,
		Amount:          0,
		Money:           s.Money,
		TradeNo:         s.TradeNo,
		PaymentMethod:   s.PaymentMethod,
		PaymentProvider: s.PaymentProvider,
		Status:          s.Status,
		CreateTime:      s.CreateTime,
		CompleteTime:    s.CompleteTime,
		PlanId:          s.PlanId,
	}
}

const orderQueryHardLimit = 10000

func GetAllOrders(filter OrderFilter, pageInfo *common.PageInfo) (orders []UnifiedOrder, total int, err error) {
	includeTopUp := filter.Type == "" || filter.Type == OrderTypeTopUp
	includeSubscription := filter.Type == "" || filter.Type == OrderTypeSubscription

	var topUpCount int64
	var subCount int64

	if includeTopUp {
		if err = buildTopUpQuery(filter).Count(&topUpCount).Error; err != nil {
			return nil, 0, err
		}
	}
	if includeSubscription {
		if err = buildSubOrderQuery(filter).Count(&subCount).Error; err != nil {
			return nil, 0, err
		}
	}

	total = int(topUpCount + subCount)

	var allOrders []UnifiedOrder

	if includeTopUp {
		var topups []*TopUp
		if err = buildTopUpQuery(filter).Order("create_time desc").Limit(orderQueryHardLimit).Find(&topups).Error; err != nil {
			return nil, 0, err
		}
		for _, t := range topups {
			allOrders = append(allOrders, topUpToUnified(t))
		}
	}

	if includeSubscription {
		var subOrders []*SubscriptionOrder
		if err = buildSubOrderQuery(filter).Order("create_time desc").Limit(orderQueryHardLimit).Find(&subOrders).Error; err != nil {
			return nil, 0, err
		}
		for _, s := range subOrders {
			allOrders = append(allOrders, subOrderToUnified(s))
		}
	}

	sort.Slice(allOrders, func(i, j int) bool {
		return allOrders[i].CreateTime > allOrders[j].CreateTime
	})

	start := pageInfo.GetStartIdx()
	end := start + pageInfo.GetPageSize()
	if start > len(allOrders) {
		start = len(allOrders)
	}
	if end > len(allOrders) {
		end = len(allOrders)
	}

	return allOrders[start:end], total, nil
}

func ExportOrders(filter OrderFilter) (orders []UnifiedOrder, err error) {
	includeTopUp := filter.Type == "" || filter.Type == OrderTypeTopUp
	includeSubscription := filter.Type == "" || filter.Type == OrderTypeSubscription

	var allOrders []UnifiedOrder

	if includeTopUp {
		var topups []*TopUp
		if err = buildTopUpQuery(filter).Order("create_time desc").Limit(orderQueryHardLimit).Find(&topups).Error; err != nil {
			return nil, err
		}
		for _, t := range topups {
			allOrders = append(allOrders, topUpToUnified(t))
		}
	}

	if includeSubscription {
		var subOrders []*SubscriptionOrder
		if err = buildSubOrderQuery(filter).Order("create_time desc").Limit(orderQueryHardLimit).Find(&subOrders).Error; err != nil {
			return nil, err
		}
		for _, s := range subOrders {
			allOrders = append(allOrders, subOrderToUnified(s))
		}
	}

	sort.Slice(allOrders, func(i, j int) bool {
		return allOrders[i].CreateTime > allOrders[j].CreateTime
	})

	return allOrders, nil
}

func GetOrderStatistics(filter OrderFilter) (*OrderStatistics, error) {
	stats := &OrderStatistics{}

	var topups []*TopUp
	var subOrders []*SubscriptionOrder

	includeTopUp := filter.Type == "" || filter.Type == OrderTypeTopUp
	includeSubscription := filter.Type == "" || filter.Type == OrderTypeSubscription

	if includeTopUp {
		if err := buildTopUpQuery(filter).Find(&topups).Error; err != nil {
			return nil, err
		}
	}
	if includeSubscription {
		if err := buildSubOrderQuery(filter).Find(&subOrders).Error; err != nil {
			return nil, err
		}
	}

	methodMap := make(map[string]*MethodRevenue)
	typeMap := map[string]*TypeRevenue{
		OrderTypeTopUp:        {Type: OrderTypeTopUp},
		OrderTypeSubscription: {Type: OrderTypeSubscription},
	}
	trendMap := make(map[string]*RevenueTrendPoint)

	for _, t := range topups {
		stats.TotalOrders++
		if t.Status == common.TopUpStatusSuccess {
			stats.SuccessOrders++
			stats.TotalRevenue += t.Money

			if _, ok := methodMap[t.PaymentMethod]; !ok {
				methodMap[t.PaymentMethod] = &MethodRevenue{Method: t.PaymentMethod}
			}
			methodMap[t.PaymentMethod].Revenue += t.Money
			methodMap[t.PaymentMethod].Count++

			typeMap[OrderTypeTopUp].Revenue += t.Money
			typeMap[OrderTypeTopUp].Count++

			dateKey := time.Unix(t.CreateTime, 0).Format("2006-01-02")
			if _, ok := trendMap[dateKey]; !ok {
				trendMap[dateKey] = &RevenueTrendPoint{Date: dateKey}
			}
			trendMap[dateKey].Revenue += t.Money
			trendMap[dateKey].Count++
		} else if t.Status == common.TopUpStatusPending {
			stats.PendingOrders++
		}
	}

	for _, s := range subOrders {
		stats.TotalOrders++
		if s.Status == common.TopUpStatusSuccess {
			stats.SuccessOrders++
			stats.TotalRevenue += s.Money

			if _, ok := methodMap[s.PaymentMethod]; !ok {
				methodMap[s.PaymentMethod] = &MethodRevenue{Method: s.PaymentMethod}
			}
			methodMap[s.PaymentMethod].Revenue += s.Money
			methodMap[s.PaymentMethod].Count++

			typeMap[OrderTypeSubscription].Revenue += s.Money
			typeMap[OrderTypeSubscription].Count++

			dateKey := time.Unix(s.CreateTime, 0).Format("2006-01-02")
			if _, ok := trendMap[dateKey]; !ok {
				trendMap[dateKey] = &RevenueTrendPoint{Date: dateKey}
			}
			trendMap[dateKey].Revenue += s.Money
			trendMap[dateKey].Count++
		} else if s.Status == common.TopUpStatusPending {
			stats.PendingOrders++
		}
	}

	if stats.TotalOrders > 0 {
		stats.SuccessRate = float64(stats.SuccessOrders) / float64(stats.TotalOrders) * 100
	}
	if stats.SuccessOrders > 0 {
		stats.AverageOrderValue = stats.TotalRevenue / float64(stats.SuccessOrders)
	}

	for _, v := range methodMap {
		stats.RevenueByMethod = append(stats.RevenueByMethod, *v)
	}
	for _, v := range typeMap {
		if v.Count > 0 {
			stats.RevenueByType = append(stats.RevenueByType, *v)
		}
	}

	var trendPoints []RevenueTrendPoint
	for _, v := range trendMap {
		trendPoints = append(trendPoints, *v)
	}
	sort.Slice(trendPoints, func(i, j int) bool {
		return trendPoints[i].Date < trendPoints[j].Date
	})
	stats.RevenueTrend = trendPoints

	return stats, nil
}
