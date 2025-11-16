// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Welcome to LoveQuest</h1>
        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">The premium dating & relationship app. Find your soulmate with confidence.</p>
        
        {/* Desktop/Mobile responsive feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
          <div className="bg-card/50 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-border/50 hover:bg-card/70 transition-colors">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Meaningful Connections</h3>
            <p className="text-muted-foreground text-sm">Connect with singles who share your values and relationship goals in a premium environment.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-border/50 hover:bg-card/70 transition-colors">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Premium Experience</h3>
            <p className="text-muted-foreground text-sm">Enjoy a luxury dating experience with advanced matching and premium features.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-border/50 hover:bg-card/70 transition-colors">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Safe & Secure</h3>
            <p className="text-muted-foreground text-sm">Your privacy and safety are our top priorities in finding your perfect match.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
