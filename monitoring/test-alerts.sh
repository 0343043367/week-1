#!/bin/bash

# Alert Testing Script for Week 2 Monitoring (Linux/Mac)
# This script triggers various scenarios to test if alerts fire correctly

BASE_URL="${1:-https://tulm.mindx.edu.vn}"
TEST_ALL="${2:-true}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

print_section() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

print_step() {
    echo -e "  ${YELLOW}⏳ $1${NC}"
}

print_success() {
    echo -e "  ${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "  ${YELLOW}⚠️  $1${NC}"
}

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}🚨 ALERT TESTING SCRIPT${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}This script will trigger various scenarios to test alerts${NC}"
echo -e "${YELLOW}Monitor Azure Portal for alert notifications!${NC}"
echo ""
echo -e "Base URL: ${BASE_URL}"
echo ""

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Error: curl is required but not installed${NC}"
    exit 1
fi

# TEST 1: HIGH ERROR RATE ALERT
print_section "TEST 1: High Error Rate Alert (>5%)"
print_step "Generating 100 requests with 10% errors..."

total_requests=100
error_count=0

for i in $(seq 1 $total_requests); do
    if [ $((i % 10)) -eq 0 ]; then
        # Generate error - request non-existent endpoint
        response=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "$BASE_URL/api/nonexistent-endpoint-$i" 2>/dev/null)
        if [ "$response" != "200" ]; then
            ((error_count++))
        fi
    else
        # Normal request
        curl -s -o /dev/null -m 5 "$BASE_URL/health" 2>/dev/null
    fi
    
    if [ $((i % 20)) -eq 0 ]; then
        echo -e "    ${GRAY}Progress: $i/$total_requests requests...${NC}"
    fi
    
    sleep 0.1
done

error_rate=$(awk "BEGIN {printf \"%.1f\", ($error_count / $total_requests) * 100}")
print_success "Generated $error_count errors (${error_rate}% error rate)"
print_warning "Expected Alert: 'High Error Rate' if >5%"
print_warning "Check Azure Portal in 5-10 minutes for alert"

# TEST 2: SERVER ERROR (5xx) ALERT
print_section "TEST 2: Server Errors Alert (5xx >10 in 5min)"
print_step "Attempting to trigger server errors..."
print_warning "Note: This requires endpoints that can return 5xx errors"

endpoints=("/api/error" "/api/throw-error" "/api/crash" "/error" "/500")

for endpoint in "${endpoints[@]}"; do
    curl -s -o /dev/null -m 5 "$BASE_URL$endpoint" 2>/dev/null
    echo -e "    ${GRAY}Attempted: $endpoint${NC}"
done

print_success "Server error test completed"
print_warning "If your API has error endpoints, configure them to trigger this test"

# TEST 3: TRAFFIC SPIKE
print_section "TEST 3: Traffic Spike (Anomaly Detection)"
print_step "Generating traffic spike with 200 requests in 30 seconds..."

start_time=$(date +%s)
request_count=200

for i in $(seq 1 $request_count); do
    curl -s -o /dev/null -m 5 "$BASE_URL/health" 2>/dev/null &
    
    if [ $((i % 50)) -eq 0 ]; then
        echo -e "    ${GRAY}Progress: $i/$request_count requests...${NC}"
    fi
    
    sleep 0.15
done

# Wait for background jobs to complete
wait

end_time=$(date +%s)
duration=$((end_time - start_time))
rps=$(awk "BEGIN {printf \"%.1f\", $request_count / $duration}")

print_success "Generated $request_count requests in ${duration}s"
print_success "Average: ${rps} requests/second"
print_warning "Expected Alert: 'Traffic Spike' (informational)"

# TEST 4: HIGH LATENCY ALERT
print_section "TEST 4: High Latency Alert (P95 >5s)"
print_step "Generating concurrent requests to increase latency..."

for i in $(seq 1 50); do
    curl -s -o /dev/null -m 30 "$BASE_URL/" 2>/dev/null &
    
    if [ $((i % 10)) -eq 0 ]; then
        echo -e "    ${GRAY}Started $i concurrent requests...${NC}"
    fi
    
    sleep 0.05
done

print_step "Waiting for requests to complete..."
wait

print_success "Latency test completed (50 concurrent requests)"
print_warning "Expected Alert: 'High P95 Latency' if >5 seconds"
print_warning "Check Azure Portal for latency metrics"

# TEST 5: AVAILABILITY CHECK
print_section "TEST 5: Availability Check"
print_step "Testing availability with 100 health checks..."

total_tests=100
failed_tests=0

for i in $(seq 1 $total_tests); do
    response=$(curl -s -o /dev/null -w "%{http_code}" -m 2 "$BASE_URL/health" 2>/dev/null)
    
    if [ "$response" != "200" ]; then
        ((failed_tests++))
    fi
    
    if [ $((i % 25)) -eq 0 ]; then
        echo -e "    ${GRAY}Progress: $i/$total_tests availability checks...${NC}"
    fi
    
    sleep 0.2
done

availability=$(awk "BEGIN {printf \"%.2f\", (($total_tests - $failed_tests) / $total_tests) * 100}")

print_success "Availability: ${availability}%"
print_success "Failed: $failed_tests/$total_tests requests"

if (( $(echo "$availability < 99" | bc -l) )); then
    print_warning "Expected Alert: 'Service Availability Below 99%'"
else
    echo -e "  ${GRAY}ℹ️  Availability above 99%, alert will not trigger${NC}"
fi

# SUMMARY
print_section "📋 TEST SUMMARY & NEXT STEPS"
echo ""
echo -e "${NC}Tests Completed! Now follow these steps:${NC}"
echo ""
echo -e "${CYAN}1. Open Azure Portal - Application Insights${NC}"
echo -e "   ${GRAY}URL: https://portal.azure.com${NC}"
echo ""
echo -e "${CYAN}2. Check Live Metrics Stream${NC}"
echo -e "   ${GRAY}- Should show recent traffic spike${NC}"
echo -e "   ${GRAY}- Should show any errors that occurred${NC}"
echo ""
echo -e "${CYAN}3. Check Alerts (wait 5-10 minutes)${NC}"
echo -e "   ${GRAY}- Navigate to: Alerts > Alert Rules${NC}"
echo -e "   ${GRAY}- Check 'Fired Alerts' tab${NC}"
echo -e "   ${GRAY}- Verify email/mobile notifications received${NC}"
echo ""
echo -e "${CYAN}4. Review Dashboards${NC}"
echo -e "   ${GRAY}- Performance: Check P95/P99 latency spike${NC}"
echo -e "   ${GRAY}- Failures: Check error rate increase${NC}"
echo -e "   ${GRAY}- Traffic: Check request volume spike${NC}"
echo ""
echo -e "${CYAN}5. Document Results${NC}"
echo -e "   ${GRAY}- Take screenshots of triggered alerts${NC}"
echo -e "   ${GRAY}- Save notification emails${NC}"
echo -e "   ${GRAY}- Update TESTING_VALIDATION.md${NC}"
echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${GREEN}✅ Alert Testing Complete!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Offer to open Azure Portal (if on macOS/Linux with open/xdg-open)
if command -v open &> /dev/null; then
    echo -n "Open Azure Portal now? (y/n): "
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        open "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/microsoft.insights%2Fcomponents"
        print_success "Opened Azure Portal"
    fi
elif command -v xdg-open &> /dev/null; then
    echo -n "Open Azure Portal now? (y/n): "
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        xdg-open "https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/microsoft.insights%2Fcomponents"
        print_success "Opened Azure Portal"
    fi
fi

