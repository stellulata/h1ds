import urllib2, json
from django.db import models

from h1ds_summary import SQL_TYPE_CODES
from h1ds_summary.utils import update_attribute_in_summary_table, delete_attr_from_summary_table

class SummaryAttribute(models.Model):
    slug = models.SlugField(max_length=100, unique=True,
                            help_text="Name of the attribute as it appears in the URL")
    name = models.CharField(max_length=500,
                            help_text="Full name of the attribute")
    source_url = models.URLField(max_length=1000,
                                 verify_exists=False,
                                 help_text="URL from H1DS MDSplus web service")

    description = models.TextField()
    data_type = models.CharField(max_length=1,
                                 help_text="Data type used to store attribute in database")
    is_default = models.BooleanField(default=False,
                                     blank=True,
                                     help_text="If true, this attribute will be shown in the default list, e.g. for shot summary.")

    display_order = models.IntegerField(default=1000,
                                        blank=False,
                                        help_text="When visible, attributes will be displayed from left to right with increasing display_order.")

    class Meta:
        ordering = ["display_order"]

    def save(self, *args, **kwargs):
        super(SummaryAttribute, self).save(*args, **kwargs)
        update_attribute_in_summary_table(self.slug, SQL_TYPE_CODES[self.data_type])

    def delete(self, *args, **kwargs):
        delete_attr_from_summary_table(self.slug)
        super(SummaryAttribute, self).delete(*args, **kwargs)
    
    def __unicode__(self):
        return self.name

    def get_value(self, shot_number):
        fetch_url = self.source_url %{'shot':shot_number}
        request = urllib2.Request(fetch_url)
        response = json.loads(urllib2.urlopen(request).read())
        value = response['data']
        if value == None:
            value = 'NULL'
        return value
