caplin.thirdparty("sl4bdummy");

temp.temp.temp.workbench.ExampleBladeApplication = function()
{
   this.m_sTemplateId = "temp.temp.temp.view-template";
   this.m_eElement;
};

temp.temp.temp.workbench.ExampleBladeApplication.prototype.start = function()
{
	this._registerServices();
	this._createPresenterComponents();
};


temp.temp.temp.workbench.ExampleBladeApplication.prototype._registerServices = function()
{
	var oLoader = new caplin.services.testing.TestServiceRegistryLoader();
	oLoader.setUserName("Tester");
	oLoader.setHtmlBundleUrl("html.bundle");
	oLoader.setXmlBUndleUrl("xml.bundle");
	oLoader.loadServices();
};

temp.temp.temp.workbench.ExampleBladeApplication.prototype._createPresenterComponents = function()
{
   this.m_oPresentationModel = new temp.temp.temp.ExampleClass();
   this.m_oPresenterComponent = new caplin.presenter.component.PresenterComponent(this.m_sTemplateId, this.m_oPresentationModel);
   this.m_oPresenterComponent.setFrame(null);
   this.m_eElement = this.m_oPresenterComponent.getElement();
   this.m_oPresenterComponent.m_bViewAttached = true; //fake it...
};

temp.temp.temp.workbench.ExampleBladeApplication.prototype.getElement = function()
{
   return this.m_eElement;
};

temp.temp.temp.workbench.ExampleBladeApplication.prototype.getPresentationModel = function()
{
   return this.m_oPresentationModel;
};
