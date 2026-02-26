class RecommendationEngine:
    def __init__(self):
        # Ultra-granular weights for v4.0 Precision
        self.weights = {
            'price': 0.25,
            'ram': 0.08,
            'storage': 0.04,
            'camera': 0.08,
            'battery': 0.08,
            'chipset': 0.12,
            'display': 0.08,
            'refresh_rate': 0.08,  # New
            'charging_w': 0.07,   # New
            'is_5g': 0.04,
            'build_quality': 0.04, # New
            'brand': 0.04
        }

    def get_recommendations(self, mobiles, preferences):
        scored_mobiles = []
        pref_price = preferences.get('priceRange', 50000)
        pref_5g = preferences.get('require5G', False)
        pref_refresh = preferences.get('refreshRate', 60)
        pref_charging = preferences.get('chargingSpeed', 18)
        
        for mobile in mobiles:
            # Hard Requirement: 5G
            if pref_5g and not mobile.get('is_5g'):
                continue
                
            score = 0
            
            # 1. Non-linear Price Penalty
            price = mobile['price']
            if price <= pref_price:
                price_score = 1.0
            else:
                over_ratio = (price - pref_price) / pref_price
                price_score = max(0, 1.0 - (over_ratio ** 1.8)) # Harder penalty for budget overage
            score += price_score * self.weights['price']
            
            # 2. Spec-Matching
            def spec_score(current, target, factor=2):
                if current >= target: return 1.0
                return (current / target) ** factor

            score += spec_score(mobile.get('ram', 0), preferences.get('ram', 8)) * self.weights['ram']
            score += spec_score(mobile.get('camera', 0), preferences.get('camera', 50)) * self.weights['camera']
            score += spec_score(mobile.get('battery', 0), 5000) * self.weights['battery']
            
            # New: Refresh Rate Match
            score += spec_score(mobile.get('refresh_rate', 60), pref_refresh, factor=1.5) * self.weights['refresh_rate']
            
            # New: Charging Speed Match
            score += spec_score(mobile.get('charging_w', 18), pref_charging, factor=1.5) * self.weights['charging_w']
            
            # 3. Performance (Chipset)
            score += (mobile.get('chipset_score', 50) / 100) * self.weights['chipset']
            
            # 4. Display Quality
            m_display = mobile.get('display', 'LCD')
            if preferences.get('display') == 'AMOLED':
                disp_score = 1.0 if m_display == 'AMOLED' else (0.4 if m_display == 'OLED' else 0.1)
            else:
                disp_score = 1.0 if m_display in ['AMOLED', 'OLED'] else 0.7
            score += disp_score * self.weights['display']
            
            # New: Build Quality
            m_build = mobile.get('build_quality', 'Standard')
            build_score = 1.0 if m_build == 'Premium' else 0.7
            score += build_score * self.weights['build_quality']
            
            # 5. Brand Preference
            pref_brand = preferences.get('brand', 'any').lower()
            brand_score = 1.0 if pref_brand == 'any' or mobile['brand'].lower() == pref_brand else 0.0
            score += brand_score * self.weights['brand']
            
            # Final Normalization and Percentage
            match_pct = round(score * 100, 1)
            mobile['match_percentage'] = match_pct
            
            # Advanced Value Score
            # Inclusion of Refresh, Charging, and Build in performance basis
            perf_basis = (
                (mobile.get('ram', 0) * 0.15) + 
                (mobile.get('chipset_score', 0) * 0.4) + 
                (mobile.get('camera', 0) * 0.2) +
                (mobile.get('refresh_rate', 60) / 144 * 10) +
                (mobile.get('charging_w', 18) / 120 * 10)
            )
            mobile['value_score'] = round((perf_basis / mobile['price']) * 10000, 2)
            
            scored_mobiles.append(mobile)
            
        ranked = sorted(scored_mobiles, key=lambda x: x['match_percentage'], reverse=True)
        
        return {
            'best_matches': ranked[:3],
            'similar_phones': ranked[3:6],
            'exact_matches': [m for m in ranked if m['match_percentage'] >= 90],
            'budget_alternatives': sorted([m for m in ranked if m['price'] < pref_price * 0.7], key=lambda x: x['match_percentage'], reverse=True)[:3],
            'better_alternatives': sorted([m for m in scored_mobiles if m['price'] > pref_price and m['price'] < pref_price * 1.4], key=lambda x: x['match_percentage'], reverse=True)[:3],
            'value_picks': sorted(scored_mobiles, key=lambda x: x['value_score'], reverse=True)[:3]
        }
