import React, { useState } from 'react';
import { ShoppingCart, TrendingUp, Upload, User, AlertCircle, Sparkles, Search, Package, BarChart3 } from 'lucide-react';
import Papa from 'papaparse';

const ProductRecommender = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          processData(results.data);
          setFileUploaded(true);
          setLoading(false);
        } catch (err) {
          setError('Error processing file: ' + err.message);
          setLoading(false);
        }
      },
      error: (err) => {
        setError('Error reading file: ' + err.message);
        setLoading(false);
      }
    });
  };

  const processData = (data) => {
    const productMap = new Map();
    const customerMap = new Map();

    data.forEach((row) => {
      const customerId = row['Customer ID'] || row.customer_id || row.CustomerID;
      const itemPurchased = row['Item Purchased'] || row.item_purchased || row.product_name || row.ProductName;
      const category = row.Category || row.category || 'Uncategorized';
      const price = parseFloat(row['Purchase Amount (USD)'] || row.price || row.Price || 0);
      const rating = parseFloat(row['Review Rating'] || row.rating || row.Rating || 0);
      const color = row.Color || row.color || '';
      const size = row.Size || row.size || '';
      const season = row.Season || row.season || '';
      
      const productKey = `${itemPurchased}_${category}`.toLowerCase().replace(/\s+/g, '_');
      
      if (itemPurchased && !productMap.has(productKey)) {
        productMap.set(productKey, {
          id: productKey,
          name: itemPurchased,
          category: category,
          price: price,
          brand: extractBrand(itemPurchased, category),
          rating: rating,
          features: extractFeatures(itemPurchased, category, color, size, season),
          color: color,
          size: size,
          season: season
        });
      }

      if (customerId && itemPurchased) {
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: `Customer ${customerId}`,
            purchases: []
          });
        }
        if (!customerMap.get(customerId).purchases.includes(productKey)) {
          customerMap.get(customerId).purchases.push(productKey);
        }
      }
    });

    setProducts(Array.from(productMap.values()));
    setCustomers(Array.from(customerMap.values()));
  };

  const extractBrand = (itemName, category) => {
    const words = itemName.trim().split(' ');
    if (words.length > 1) return words[0];
    return category;
  };

  const extractFeatures = (itemName, category, color, size, season) => {
    const features = [];
    const text = `${itemName} ${category}`.toLowerCase();
    
    features.push(category.toLowerCase().replace(/\s+/g, '-'));
    if (color) features.push(color.toLowerCase());
    if (size) features.push(`size-${size.toLowerCase()}`);
    if (season) features.push(season.toLowerCase());
    
    const keywords = ['wireless', 'bluetooth', 'smart', 'digital', 'portable', 'cotton', 'leather', 'denim', 'silk', 'wool', 'running', 'casual', 'formal', 'sport', 'athletic', 'waterproof', 'vintage', 'modern', 'classic', 'comfortable', 'lightweight', 'premium'];
    keywords.forEach(keyword => {
      if (text.includes(keyword)) features.push(keyword);
    });

    return [...new Set(features)];
  };

  const calculateSimilarity = (product1, product2) => {
    let score = 0;
    const features1 = new Set(product1.features);
    const features2 = new Set(product2.features);
    const commonFeatures = [...features1].filter(f => features2.has(f));
    score += commonFeatures.length * 3;
    
    if (product1.category === product2.category) score += 4;
    if (product1.brand === product2.brand) score += 1.5;
    
    if (product1.price > 0 && product2.price > 0) {
      const priceDiff = Math.abs(product1.price - product2.price) / product1.price;
      if (priceDiff < 0.4) score += 1;
    }
    
    const ratingDiff = Math.abs(product1.rating - product2.rating);
    if (ratingDiff < 0.5) score += 0.5;
    
    return score;
  };

  const generateRecommendations = (customer) => {
    if (!customer || !customer.purchases.length) {
      setError('No purchase history found for this customer');
      return;
    }

    const purchasedProducts = products.filter(p => customer.purchases.includes(p.id));
    const candidateProducts = products.filter(p => !customer.purchases.includes(p.id));
    
    if (candidateProducts.length === 0) {
      setError('Customer has purchased all available products!');
      return;
    }

    const scoredProducts = candidateProducts.map(candidate => {
      let totalScore = 0;
      purchasedProducts.forEach(purchased => {
        totalScore += calculateSimilarity(purchased, candidate);
      });
      return { ...candidate, score: totalScore / purchasedProducts.length };
    });
    
    const topRecommendations = scoredProducts.sort((a, b) => b.score - a.score).slice(0, 10);
    setRecommendations(topRecommendations);
    setError(null);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    generateRecommendations(customer);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toString().includes(searchTerm)
  );

  const getProductInitials = (productName) => {
    const words = productName.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return productName.slice(0, 2).toUpperCase();
  };

  const getProductColor = (productName) => {
    const colors = ['#f87171', '#60a5fa', '#4ade80', '#a78bfa', '#fb923c', '#22d3ee', '#ec4899', '#84cc16', '#14b8a6', '#ef4444'];
    const index = productName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(to bottom right, #eef2ff, #faf5ff, #fce7f3)', fontFamily: 'Arial, sans-serif' },
    header: { background: 'linear-gradient(to right, #4f46e5, #7c3aed, #db2777)', color: 'white', padding: '48px 32px' },
    headerContent: { maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' },
    subtitle: { fontSize: '18px', opacity: 0.9, maxWidth: '600px' },
    main: { maxWidth: '1280px', margin: '0 auto', padding: '32px' },
    uploadBox: { background: 'white', borderRadius: '24px', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', padding: '48px', marginBottom: '32px', border: '1px solid #e5e7eb', textAlign: 'center' },
    uploadIcon: { width: '96px', height: '96px', background: 'linear-gradient(to bottom right, #e0e7ff, #f3e8ff)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' },
    uploadBtn: { background: 'linear-gradient(to right, #4f46e5, #7c3aed)', color: 'white', padding: '20px 40px', borderRadius: '16px', fontWeight: '600', fontSize: '18px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', transition: 'all 0.3s' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' },
    statCard: { borderRadius: '24px', padding: '24px', color: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', transition: 'all 0.3s' },
    stat1: { background: 'linear-gradient(to bottom right, #3b82f6, #1e40af)' },
    stat2: { background: 'linear-gradient(to bottom right, #a855f7, #6d28d9)' },
    stat3: { background: 'linear-gradient(to bottom right, #ec4899, #be185d)' },
    statNum: { fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' },
    statLabel: { fontSize: '16px', opacity: 0.9 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
    panel: { background: 'white', borderRadius: '24px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '24px', border: '1px solid #e5e7eb' },
    panelTitle: { fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' },
    searchBox: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' },
    customerItem: { padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '2px solid #e5e7eb' },
    productCard: { padding: '16px', borderRadius: '16px', marginBottom: '12px', display: 'flex', gap: '12px', border: '2px solid #dbeafe', background: '#f0f9ff' },
    productInitials: { width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 },
    recommendCard: { padding: '16px', borderRadius: '16px', marginBottom: '12px', display: 'flex', gap: '12px', border: '2px solid #dcfce7', background: '#f0fdf4' },
    recommendNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(to bottom right, #16a34a, #166534)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 },
    emptyState: { textAlign: 'center', paddingTop: '64px', paddingBottom: '64px' },
    emptyIcon: { width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
    emptyText: { color: '#6b7280', fontSize: '16px' },
    scrollable: { maxHeight: '384px', overflowY: 'auto', paddingRight: '8px' },
    errorBox: { background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '16px', padding: '24px', marginBottom: '24px', display: 'flex', gap: '12px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <div style={styles.title}>
              <Sparkles size={32} />
              Smart Recommendations
            </div>
            <p style={styles.subtitle}>AI-powered product recommendations using advanced content-based filtering</p>
          </div>
          {fileUploaded && (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
              <BarChart3 size={48} style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '12px', opacity: 0.9 }}>Analytics Ready</p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.main}>
        {!fileUploaded && (
          <div style={styles.uploadBox}>
            <div style={styles.uploadIcon}>
              <Upload size={48} color="#4f46e5" />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>Upload Your Data</h2>
            <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '16px' }}>Upload your shopping trends CSV file to unlock personalized AI recommendations</p>
            
            <label style={{ display: 'inline-block' }}>
              <input type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
              <div style={styles.uploadBtn} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}>
                <Upload size={20} style={{ display: 'inline-block', marginRight: '8px' }} />
                Choose CSV File
              </div>
            </label>
            
            {loading && (
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <div style={{ animation: 'spin 1s linear infinite', width: '24px', height: '24px', border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5', borderRadius: '50%' }}></div>
                <p style={{ color: '#4f46e5', fontWeight: '600', fontSize: '16px' }}>Processing your data...</p>
              </div>
            )}

            <div style={{ marginTop: '48px', background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} />
                Expected CSV Format:
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#374151', overflowX: 'auto', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                Customer ID, Item Purchased, Category, Purchase Amount (USD), Review Rating<br/>
                1, Blouse, Clothing, 53, 3.1<br/>
                2, Sweater, Clothing, 64, 3.1
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ color: '#991b1b', fontWeight: '500' }}>{error}</p>
          </div>
        )}

        {fileUploaded && (
          <>
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, ...styles.stat1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <Package size={32} style={{ marginRight: '12px' }} />
                </div>
                <div style={styles.statNum}>{products.length}</div>
                <div style={styles.statLabel}>Unique Products</div>
              </div>
              <div style={{ ...styles.statCard, ...styles.stat2 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <User size={32} style={{ marginRight: '12px' }} />
                </div>
                <div style={styles.statNum}>{customers.length}</div>
                <div style={styles.statLabel}>Total Customers</div>
              </div>
              <div style={{ ...styles.statCard, ...styles.stat3 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <ShoppingCart size={32} style={{ marginRight: '12px' }} />
                </div>
                <div style={styles.statNum}>{customers.reduce((sum, c) => sum + c.purchases.length, 0)}</div>
                <div style={styles.statLabel}>Total Purchases</div>
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>
                  <User size={24} color="#4f46e5" />
                  Customers
                </div>
                <input type="text" placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchBox} />
                <div style={styles.scrollable}>
                  {filteredCustomers.map(customer => (
                    <div key={customer.id} onClick={() => handleCustomerSelect(customer)} style={{...styles.customerItem, background: selectedCustomer?.id === customer.id ? 'linear-gradient(to right, #4f46e5, #7c3aed)' : '#f9fafb', color: selectedCustomer?.id === customer.id ? 'white' : '#1f2937', borderColor: selectedCustomer?.id === customer.id ? '#4f46e5' : '#e5e7eb'}}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: selectedCustomer?.id === customer.id ? 'rgba(255,255,255,0.2)' : '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: selectedCustomer?.id === customer.id ? 'white' : '#4f46e5' }}>
                        {customer.id.toString().slice(-2)}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600' }}>{customer.name}</p>
                        <p style={{ fontSize: '13px', opacity: 0.8 }}>{customer.purchases.length} items purchased</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.panelTitle}>
                  <ShoppingCart size={24} color="#2563eb" />
                  Purchase History
                </div>
                {selectedCustomer ? (
                  <div style={styles.scrollable}>
                    {products.filter(p => selectedCustomer.purchases.includes(p.id)).map(product => (
                      <div key={product.id} style={styles.productCard}>
                        <div style={{ ...styles.productInitials, background: getProductColor(product.name) }}>
                          {getProductInitials(product.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontWeight: '600', color: '#1f2937' }}>{product.name}</h3>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{product.category}</p>
                          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5' }}>${product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      <ShoppingCart size={40} color="#d1d5db" />
                    </div>
                    <p style={styles.emptyText}>Select a customer to view history</p>
                  </div>
                )}
              </div>

              <div style={styles.panel}>
                <div style={styles.panelTitle}>
                  <TrendingUp size={24} color="#16a34a" />
                  AI Recommendations
                </div>
                {recommendations.length > 0 ? (
                  <div style={styles.scrollable}>
                    {recommendations.map((product, index) => (
                      <div key={product.id} style={styles.recommendCard}>
                        <span style={styles.recommendNum}>{index + 1}</span>
                        <div style={{ ...styles.productInitials, background: getProductColor(product.name) }}>
                          {getProductInitials(product.name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontWeight: '600', color: '#1f2937' }}>{product.name}</h3>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{product.category}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>${product.price.toFixed(2)}</p>
                            <span style={{ background: '#16a34a', color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>Match: {product.score.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      <Sparkles size={40} color="#d1d5db" />
                    </div>
                    <p style={styles.emptyText}>Select a customer for AI recommendations</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProductRecommender;