using System.Collections.Generic;
using System.Linq;
using System.Web.Script.Serialization;
using SenseNet.ApplicationModel;
using SenseNet.ContentRepository;

namespace SenseNet.OData
{
    public static class AspectActions
    {
        [ODataFunction]
        public static string GetAspects(Content content)
        {
            List<string> aspectNames = new List<string>();
            if (content.AspectFields != null && content.AspectFields.Any())
                aspectNames = content.AspectFields.Select(aspect => aspect.Key.Split('.').First()).Distinct().ToList();
            return new JavaScriptSerializer().Serialize(aspectNames);
        }
    }
}